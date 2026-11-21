"""Guarded agent tools – every file read, write, and test run passes through
the Zero-Trust PolicyEngine before execution."""

from __future__ import annotations

import subprocess
from pathlib import Path

from aegis.guardrails import PolicyEngine


def build_tools(policy: PolicyEngine) -> dict:
    """Create sandboxed tool functions bound to *policy* and return them as a
    name → callable mapping.

    Parameters
    ----------
    policy:
        A fully-initialised :class:`PolicyEngine` whose ``workspace_root``
        defines the boundary for all file operations.

    Returns
    -------
    dict
        ``{"read_source_file": fn, "apply_file_patch": fn,
        "run_sandbox_tests": fn}``
    """

    agent_name: str = "aegis-agent"

    # ------------------------------------------------------------------ #
    # Tool 1 – read_source_file
    # ------------------------------------------------------------------ #
    def read_source_file(relative_path: str) -> dict:
        """Read a source file, validate its path, and sanitize the content.

        Parameters
        ----------
        relative_path:
            Path relative to the workspace root.

        Returns
        -------
        dict
            Keys: ``file`` (str), ``content`` (sanitized str),
            ``security_alerts`` (list of alert strings).
        """
        resolved: Path = policy.validate_path(agent_name, relative_path)
        raw_content: str = resolved.read_text(encoding="utf-8")
        cleaned_content, alerts = policy.sanitize_untrusted_code(
            agent_name, relative_path, raw_content
        )
        return {
            "file": relative_path,
            "content": cleaned_content,
            "security_alerts": alerts,
        }

    # ------------------------------------------------------------------ #
    # Tool 2 – apply_file_patch
    # ------------------------------------------------------------------ #
    def apply_file_patch(relative_path: str, updated_content: str) -> dict:
        """Overwrite a file with *updated_content* after policy validation.

        A byte-count of the previous content is captured as a lightweight
        backup reference before the write occurs.

        Parameters
        ----------
        relative_path:
            Path relative to the workspace root.
        updated_content:
            The full new content to write into the file.

        Returns
        -------
        dict
            Keys: ``status`` (str), ``file`` (str),
            ``backup_bytes`` (int – size of the original content in bytes).
        """
        resolved: Path = policy.validate_path(agent_name, relative_path)

        # Capture backup size (0 if the file doesn't exist yet).
        backup_bytes: int = 0
        if resolved.exists():
            backup_bytes = len(resolved.read_bytes())

        resolved.write_text(updated_content, encoding="utf-8")

        policy.log_event(
            agent=agent_name,
            action="FILE_WRITE",
            target=relative_path,
            status="OK",
            detail=f"wrote {len(updated_content)} chars, backup was {backup_bytes} bytes",
        )

        return {
            "status": "written",
            "file": relative_path,
            "backup_bytes": backup_bytes,
        }

    # ------------------------------------------------------------------ #
    # Tool 3 – run_sandbox_tests
    # ------------------------------------------------------------------ #
    def run_sandbox_tests(command: str = "pytest") -> dict:
        """Run a test command in a sandboxed subprocess.

        The command is validated against the policy allowlist before
        execution.  Output is capped to the last 1 500 characters to keep
        payloads manageable.

        Parameters
        ----------
        command:
            Shell command to execute (must be on the allowlist).

        Returns
        -------
        dict
            Keys: ``passed`` (bool), ``stdout`` (str, last 1500 chars),
            ``stderr`` (str, last 1500 chars).
        """
        policy.validate_command(agent_name, command)

        try:
            result = subprocess.run(
                command,
                shell=True,
                timeout=20,
                capture_output=True,
                text=True,
                cwd=str(policy.workspace_root),
            )
            passed: bool = result.returncode == 0
            stdout: str = result.stdout[-1500:]
            stderr: str = result.stderr[-1500:]
        except subprocess.TimeoutExpired:
            passed = False
            stdout = ""
            stderr = "Process timed out after 20 seconds."

        policy.log_event(
            agent=agent_name,
            action="TEST_RUN",
            target=command,
            status="PASS" if passed else "FAIL",
            detail=f"stdout_tail={len(stdout)} chars, stderr_tail={len(stderr)} chars",
        )

        return {
            "passed": passed,
            "stdout": stdout,
            "stderr": stderr,
        }

    # ------------------------------------------------------------------ #
    # Return name → callable mapping
    # ------------------------------------------------------------------ #
    return {
        "read_source_file": read_source_file,
        "apply_file_patch": apply_file_patch,
        "run_sandbox_tests": run_sandbox_tests,
    }
