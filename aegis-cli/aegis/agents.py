"""
Multi-agent orchestration pipeline for Aegis security scanner.

Coordinates a Scanner Agent, Patcher Agent, and Verifier Agent through
a zero-trust policy engine to audit, fix, and verify source code.
"""

import json
import os
import re

from google import genai
from google.genai import types

from aegis.guardrails import PolicyEngine
from aegis.tools import build_tools


class AegisOrchestrator:
    """Orchestrates a multi-agent pipeline for secure code auditing and patching.

    The pipeline flows through five steps:
        1. Secure Read  — load and sanitize the target file
        2. Scanner Agent — Gemini 2.5 Flash audits for OWASP vulnerabilities
        3. Patcher Agent — Gemini 2.5 Pro generates a fixed version
        4. Apply Patch   — write the patched code back through the policy engine
        5. Verifier      — run tests; rollback on failure
    """

    SCANNER_MODEL = "gemini-2.5-flash"
    PATCHER_MODEL = "gemini-2.5-pro"

    def __init__(self, workspace_root: str) -> None:
        """Initialise the orchestrator.

        Args:
            workspace_root: Absolute path to the project root directory.
        """
        self.workspace_root = workspace_root
        self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        self.policy = PolicyEngine(workspace_root)
        self.tools = build_tools(self.policy)

    # ------------------------------------------------------------------
    # Pipeline
    # ------------------------------------------------------------------

    def run_pipeline(self, target_file: str) -> dict:
        """Execute the full scan → patch → verify pipeline.

        Args:
            target_file: Path to the file to audit, relative to workspace root.

        Returns:
            A dict with keys ``alerts``, ``scan``, ``patched``, ``patch_applied``,
            and ``tests`` summarising every stage.
        """
        result: dict = {
            "alerts": [],
            "scan": None,
            "patched": False,
            "patch_applied": False,
            "tests": None,
        }

        try:
            # ── Step 1 — Secure Read ─────────────────────────────────
            read_result = self.tools["read_source_file"](target_file)
            sanitized_code = read_result["content"]
            result["alerts"] = read_result.get("security_alerts", [])

            # ── Step 2 — Scanner Agent (Gemini 2.5 Flash) ────────────
            scan_prompt = (
                "You are a senior application-security auditor.\n"
                "Audit the following source code for OWASP Top-10 vulnerabilities.\n"
                "Focus on: SQL injection, hardcoded secrets/credentials, "
                "unsafe use of exec/eval, path traversal, and command injection.\n\n"
                "Return your findings as JSON with exactly two keys:\n"
                '  "vulnerabilities": a list of objects, each with "line" (int), '
                '"severity" ("critical"|"high"|"medium"|"low"), and "issue" (string).\n'
                '  "needs_patch": a boolean — true if any vulnerability requires a code fix.\n\n'
                f"```\n{sanitized_code}\n```"
            )

            scanner_response = self.client.models.generate_content(
                model=self.SCANNER_MODEL,
                contents=scan_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )

            scan_data = json.loads(scanner_response.text)
            result["scan"] = scan_data

            # ── Step 3 — Patcher Agent (Gemini 2.5 Pro) ──────────────
            if not scan_data.get("needs_patch", False):
                return result

            patcher_prompt = (
                "You are a senior secure-coding engineer.\n"
                "The security scanner found the following vulnerabilities:\n\n"
                f"{json.dumps(scan_data['vulnerabilities'], indent=2)}\n\n"
                "Original source code:\n"
                f"```\n{sanitized_code}\n```\n\n"
                "Produce ONLY the complete fixed source file.  "
                "Do not include any explanation, markdown fences, or commentary — "
                "just the raw source code."
            )

            patcher_response = self.client.models.generate_content(
                model=self.PATCHER_MODEL,
                contents=patcher_prompt,
            )

            patched_code = patcher_response.text
            # Strip markdown fences if the model added them despite instructions
            patched_code = re.sub(
                r"^```[\w]*\n", "", patched_code, count=1
            )
            patched_code = re.sub(r"\n```\s*$", "", patched_code, count=1)
            result["patched"] = True

            # ── Step 4 — Apply Patch ─────────────────────────────────
            patch_result = self.tools["apply_file_patch"](
                target_file, patched_code
            )
            result["patch_applied"] = patch_result.get("status") == "written"

            # ── Step 5 — Verifier Agent ──────────────────────────────
            test_result = self.tools["run_sandbox_tests"]("pytest")
            result["tests"] = test_result

            if not test_result.get("passed", False):
                # Rollback: re-read backup and restore original content
                backup_read = self.tools["read_source_file"](target_file)
                # The backup was created by apply_file_patch; restore from it
                backup_path = (
                    self.policy.validate_path("verifier", target_file)
                )
                backup_file = str(backup_path) + ".bak"
                if os.path.exists(backup_file):
                    with open(backup_file, "r", encoding="utf-8") as fh:
                        original_content = fh.read()
                    with open(str(backup_path), "w", encoding="utf-8") as fh:
                        fh.write(original_content)
                    self.policy.log_event(
                        agent="verifier",
                        action="ROLLBACK",
                        target=target_file,
                        status="RESTORED",
                        detail="Tests failed — original file restored from backup",
                    )
                    result["patch_applied"] = False

        except Exception as exc:
            result["error"] = f"{type(exc).__name__}: {exc}"

        return result

    # ------------------------------------------------------------------
    # Dunder helpers
    # ------------------------------------------------------------------

    def __str__(self) -> str:
        return (
            f"AegisOrchestrator(workspace={self.workspace_root!r}, "
            f"scanner={self.SCANNER_MODEL}, patcher={self.PATCHER_MODEL})"
        )

    def __repr__(self) -> str:
        return self.__str__()
