"""
aegis.guardrails — Zero-Trust Policy Engine
============================================

Provides path validation, command allow-listing, and prompt-injection
scanning for every agent action inside the Aegis sandbox.
"""

from __future__ import annotations

import json
import re
import datetime
from pathlib import Path
from typing import List, Tuple

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BLOCKED_FILES: set[str] = {
    ".env",
    "id_rsa",
    "secrets.json",
    ".git",
}
"""File names (or directory names) that no agent may read, write, or reference."""

ALLOWED_COMMANDS: set[str] = {
    "pytest",
    "python -m pytest",
    "npm test",
}
"""Exact command strings an agent is permitted to execute."""

INJECTION_PATTERNS: list[re.Pattern[str]] = [
    # Direct "ignore previous instructions" family
    re.compile(
        r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|rules?|constraints?)",
        re.IGNORECASE,
    ),
    # "You are now …" role-override attempts
    re.compile(
        r"you\s+are\s+now\s+",
        re.IGNORECASE,
    ),
    # System-prompt override markers
    re.compile(
        r"<\s*system\s*>",
        re.IGNORECASE,
    ),
    # "Act as …" / "Pretend to be …" jailbreak openers
    re.compile(
        r"(act|pretend|behave)\s+(as|like|to\s+be)\s+",
        re.IGNORECASE,
    ),
    # Encoded / obfuscated instruction injection (base-64 header or eval)
    re.compile(
        r"(eval|exec)\s*\(\s*(base64|b64decode)",
        re.IGNORECASE,
    ),
    # "Do not follow" / "disregard" safety instructions
    re.compile(
        r"(disregard|do\s+not\s+follow|override)\s+(safety|security|policy|guard)",
        re.IGNORECASE,
    ),
    # Prompt-leaking attempts
    re.compile(
        r"(print|reveal|show|output|repeat)\s+(your|the|system)\s+(prompt|instructions?|rules?)",
        re.IGNORECASE,
    ),
    # Delimiter / context-break injection
    re.compile(
        r"(END|BEGIN)\s+(SYSTEM|INSTRUCTION|PROMPT)",
        re.IGNORECASE,
    ),
]
"""Compiled regex patterns that flag likely prompt-injection attempts inside
code comments, docstrings, or other untrusted text."""

QUARANTINE_MARKER: str = "# [QUARANTINED BY AEGIS]"
"""Replacement text inserted in place of every quarantined line."""


# ---------------------------------------------------------------------------
# Exception
# ---------------------------------------------------------------------------

class PolicyViolation(Exception):
    """Raised when an agent action violates a zero-trust policy rule."""


# ---------------------------------------------------------------------------
# Policy Engine
# ---------------------------------------------------------------------------

class PolicyEngine:
    """Stateful engine that validates agent actions against the zero-trust
    policy and writes an append-only audit log in JSONL format.

    Parameters
    ----------
    workspace_root:
        Absolute path to the workspace directory.  Every path an agent
        references is resolved relative to this root.
    log_path:
        File name (or relative path) for the append-only JSONL audit log.
        Defaults to ``audit_log.jsonl`` inside *workspace_root*.
    """

    def __init__(self, workspace_root: str, log_path: str = "audit_log.jsonl") -> None:
        self.workspace_root: Path = Path(workspace_root).resolve()
        self.log_path: Path = self.workspace_root / log_path

    # ----- audit logging ---------------------------------------------------

    def log_event(
        self,
        agent: str,
        action: str,
        target: str,
        status: str,
        detail: str = "",
    ) -> None:
        """Append a structured JSON event to the audit log.

        Parameters
        ----------
        agent:
            Identifier of the agent performing the action.
        action:
            Short verb describing the action (e.g. ``READ``, ``EXEC``).
        target:
            The file path, command, or resource being acted upon.
        status:
            Outcome — typically ``ALLOWED``, ``BLOCKED``, or ``QUARANTINED``.
        detail:
            Optional free-text explanation or context.
        """
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "agent": agent,
            "action": action,
            "target": target,
            "status": status,
            "detail": detail,
        }
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(event, ensure_ascii=False) + "\n")

    # ----- path validation -------------------------------------------------

    def validate_path(self, agent: str, relative_path: str) -> Path:
        """Resolve *relative_path* inside the workspace and enforce path rules.

        Checks performed:

        1. **Path traversal** — the resolved path must remain inside
           ``workspace_root``.
        2. **Blocked files** — the file or directory name must not appear in
           :data:`BLOCKED_FILES`.

        Parameters
        ----------
        agent:
            Identifier of the requesting agent.
        relative_path:
            Path relative to the workspace root.

        Returns
        -------
        Path
            The fully-resolved ``pathlib.Path`` if the access is allowed.

        Raises
        ------
        PolicyViolation
            If the path escapes the workspace or targets a blocked file.
        """
        resolved: Path = (self.workspace_root / relative_path).resolve()

        # 1. Path traversal check
        try:
            resolved.relative_to(self.workspace_root)
        except ValueError:
            self.log_event(
                agent,
                "PATH_ACCESS",
                relative_path,
                "BLOCKED",
                "Path traversal detected — resolved path escapes workspace root.",
            )
            raise PolicyViolation(
                f"Path traversal blocked: '{relative_path}' resolves outside the workspace."
            )

        # 2. Blocked-file check (match against every component in the path)
        for part in resolved.parts:
            if part in BLOCKED_FILES:
                self.log_event(
                    agent,
                    "PATH_ACCESS",
                    relative_path,
                    "BLOCKED",
                    f"Blocked file or directory component: '{part}'.",
                )
                raise PolicyViolation(
                    f"Access to blocked resource denied: '{part}' in path '{relative_path}'."
                )

        self.log_event(agent, "PATH_ACCESS", relative_path, "ALLOWED")
        return resolved

    # ----- command validation ----------------------------------------------

    def validate_command(self, agent: str, command: str) -> None:
        """Check *command* against the allow-list and raise on violation.

        Only commands whose **full string** appears in :data:`ALLOWED_COMMANDS`
        are permitted.

        Parameters
        ----------
        agent:
            Identifier of the requesting agent.
        command:
            The exact command string the agent wishes to execute.

        Raises
        ------
        PolicyViolation
            If the command is not in the allow-list.
        """
        if command not in ALLOWED_COMMANDS:
            self.log_event(
                agent,
                "COMMAND_EXEC",
                command,
                "BLOCKED",
                f"Command not in allow-list. Allowed: {sorted(ALLOWED_COMMANDS)}",
            )
            raise PolicyViolation(
                f"Command blocked: '{command}' is not in the allow-list."
            )

        self.log_event(agent, "COMMAND_EXEC", command, "ALLOWED")

    # ----- untrusted-code sanitisation -------------------------------------

    def sanitize_untrusted_code(
        self,
        agent: str,
        filename: str,
        content: str,
    ) -> Tuple[str, List[str]]:
        """Scan *content* for prompt-injection patterns and quarantine matches.

        Each line that matches one or more patterns in :data:`INJECTION_PATTERNS`
        is replaced with :data:`QUARANTINE_MARKER`.  Every quarantined line is
        independently logged as a ``QUARANTINED`` event in the audit log.

        Parameters
        ----------
        agent:
            Identifier of the requesting agent.
        filename:
            The name or path of the file being scanned (used in log entries).
        content:
            The raw text content to sanitise.

        Returns
        -------
        tuple[str, list[str]]
            A 2-tuple of ``(cleaned_content, alerts)`` where *cleaned_content*
            is the sanitised text and *alerts* is a list of human-readable
            warning strings for every quarantined line.
        """
        lines: list[str] = content.splitlines(keepends=True)
        alerts: list[str] = []

        for idx, line in enumerate(lines, start=1):
            for pattern in INJECTION_PATTERNS:
                if pattern.search(line):
                    alert_msg = (
                        f"Line {idx} in '{filename}' matched injection pattern "
                        f"/{pattern.pattern}/ — quarantined."
                    )
                    alerts.append(alert_msg)

                    self.log_event(
                        agent,
                        "CODE_SCAN",
                        filename,
                        "QUARANTINED",
                        alert_msg,
                    )

                    # Preserve the original line ending (if any) after the marker
                    ending = "\n" if line.endswith("\n") else ""
                    lines[idx - 1] = QUARANTINE_MARKER + ending
                    break  # one quarantine per line is enough

        cleaned_content: str = "".join(lines)

        if not alerts:
            self.log_event(agent, "CODE_SCAN", filename, "ALLOWED", "No injection patterns found.")

        return cleaned_content, alerts
