"""
AegisCLI — Beautiful Rich terminal interface for the Zero-Trust
Multi-Agent DevSecOps pipeline.
"""

import argparse
import difflib
import json
import os
import sys
import time
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.syntax import Syntax
from rich.text import Text
from rich import print as rprint


# ── Colour palette ──────────────────────────────────────────────────
BRAND   = "bold bright_cyan"
SUCCESS = "bold green"
DANGER  = "bold red"
WARN    = "bold yellow"
MUTED   = "dim white"


def _banner(console: Console) -> None:
    """Print the startup banner."""
    title = Text()
    title.append("⚡ ", style="bright_yellow")
    title.append("AegisCLI", style="bold bright_cyan")
    title.append(" — ", style="dim")
    title.append("Zero-Trust Multi-Agent DevSecOps Engineer", style="bright_white")

    subtitle = Text()
    subtitle.append("Sanitize → Scan → Patch → Verify", style="dim italic")

    banner_text = Text.assemble(title, "\n", subtitle)

    console.print(
        Panel(
            banner_text,
            border_style="bright_cyan",
            padding=(1, 4),
            title="[bold bright_white]v1.0.0[/]",
            title_align="right",
        )
    )
    console.print()


def _quarantine_panel(console: Console, alerts: list[dict]) -> None:
    """Display a red quarantine panel listing every injection attempt."""
    lines = []
    for alert in alerts:
        pattern = alert.get("pattern", "unknown pattern")
        line_no = alert.get("line", "?")
        matched = alert.get("matched_text", "")
        lines.append(f"  [bold red]✖[/] Line {line_no}: {pattern}")
        if matched:
            lines.append(f"    [dim]→ {matched[:120]}[/]")

    body = "\n".join(lines) if lines else "  (no details available)"
    console.print(
        Panel(
            body,
            title="🚨 QUARANTINE ALERT",
            title_align="left",
            border_style="red",
            padding=(1, 2),
        )
    )
    console.print()


def _vuln_table(console: Console, vulns: list[dict]) -> None:
    """Render a vulnerability table with coloured severity badges."""
    table = Table(
        title="🔍  Vulnerability Scan Results",
        title_style="bold bright_white",
        border_style="bright_cyan",
        header_style="bold bright_white on grey23",
        show_lines=True,
        expand=True,
    )
    table.add_column("Line", justify="right", style="bright_white", width=6)
    table.add_column("Severity", justify="center", width=10)
    table.add_column("Issue", style="white", ratio=1)

    severity_styles = {
        "HIGH":     "bold white on red",
        "CRITICAL": "bold white on red",
        "MEDIUM":   "bold black on yellow",
        "LOW":      "bold black on bright_green",
    }

    for v in vulns:
        sev = v.get("severity", "MEDIUM").upper()
        style = severity_styles.get(sev, "bold white")
        sev_text = Text(f" {sev} ", style=style)
        table.add_row(
            str(v.get("line", "?")),
            sev_text,
            v.get("issue", "—"),
        )

    console.print(table)
    console.print()


def _diff_panel(console: Console, original: str, patched: str, filename: str) -> None:
    """Show a unified diff between original and patched code."""
    diff_lines = list(difflib.unified_diff(
        original.splitlines(keepends=True),
        patched.splitlines(keepends=True),
        fromfile=f"a/{filename}",
        tofile=f"b/{filename}",
    ))

    if not diff_lines:
        console.print(
            Panel("[dim]No changes — file already clean.[/]",
                  title="📄 Diff", border_style="green")
        )
        console.print()
        return

    diff_text = "".join(diff_lines)
    syntax = Syntax(
        diff_text,
        "diff",
        theme="monokai",
        line_numbers=False,
        word_wrap=True,
    )
    console.print(
        Panel(
            syntax,
            title="📄  Patch Diff",
            title_align="left",
            border_style="bright_cyan",
            padding=(1, 2),
        )
    )
    console.print()


def _test_result_panel(console: Console, passed: bool) -> None:
    """Display a green PASSED or red FAILED panel."""
    if passed:
        console.print(
            Panel(
                "[bold green]✅  ALL TESTS PASSED[/]\n"
                "[dim]Patched code has been verified and committed.[/]",
                border_style="green",
                padding=(1, 3),
            )
        )
    else:
        console.print(
            Panel(
                "[bold red]❌  TESTS FAILED — Rolling back[/]\n"
                "[dim]Original code has been restored from backup.[/]",
                border_style="red",
                padding=(1, 3),
            )
        )
    console.print()


def _summary_panel(console: Console, result: dict) -> None:
    """Final summary panel with event counts."""
    alerts_count = len(result.get("alerts", []))
    vulns_count  = len(result.get("scan", {}).get("vulnerabilities", []))
    patched      = result.get("patched", False)
    tests_passed = result.get("tests", {}).get("passed", False)

    events = alerts_count + vulns_count + (1 if patched else 0) + 1  # +1 for test run

    summary_lines = [
        f"[bright_cyan]Quarantined injections:[/]  [bold]{alerts_count}[/]",
        f"[bright_cyan]Vulnerabilities found:[/]   [bold]{vulns_count}[/]",
        f"[bright_cyan]Patch applied:[/]           [bold]{'Yes' if patched else 'No'}[/]",
        f"[bright_cyan]Tests passed:[/]            [bold]{'Yes ✅' if tests_passed else 'No ❌'}[/]",
        "",
        f"[bold bright_white]Total events processed:  {events}[/]",
    ]

    console.print(
        Panel(
            "\n".join(summary_lines),
            title="📊  Pipeline Summary",
            title_align="left",
            border_style="bright_cyan",
            padding=(1, 3),
        )
    )


def main() -> None:
    """Entry-point for the AegisCLI Rich terminal interface."""

    # ── Argument parsing ────────────────────────────────────────────
    parser = argparse.ArgumentParser(
        prog="aegis",
        description="AegisCLI — Zero-Trust Multi-Agent DevSecOps Engineer",
    )
    sub = parser.add_subparsers(dest="command")

    audit_parser = sub.add_parser("audit", help="Run the full DevSecOps pipeline on a file")
    audit_parser.add_argument("workspace_dir", type=str, help="Root directory of the workspace")
    audit_parser.add_argument("target_file", type=str, help="Relative path to the file to audit")

    args = parser.parse_args()

    if args.command != "audit":
        parser.print_help()
        sys.exit(1)

    # ── Console setup ───────────────────────────────────────────────
    console = Console()
    console.print()
    _banner(console)

    workspace = args.workspace_dir
    target    = args.target_file

    console.print(f"[dim]Workspace:[/]  [bright_white]{workspace}[/]")
    console.print(f"[dim]Target:[/]     [bright_white]{target}[/]")
    console.print()

    # ── Import orchestrator (deferred so CLI loads fast) ────────────
    from aegis.agents import AegisOrchestrator  # noqa: E402

    orchestrator = AegisOrchestrator(workspace)

    # ── Read the original source for later diff ─────────────────────
    original_path = Path(workspace) / target
    original_code = original_path.read_text(encoding="utf-8") if original_path.exists() else ""

    # ── Run the pipeline with Rich spinners ─────────────────────────
    result: dict = {}

    stages = [
        ("Sanitizing untrusted code …",   "step1"),
        ("Scanning for vulnerabilities …", "step2"),
        ("Generating secure patch …",      "step3"),
        ("Verifying with test suite …",    "step4"),
    ]

    with Progress(
        SpinnerColumn("dots", style="bright_cyan"),
        TextColumn("[progress.description]{task.description}"),
        console=console,
        transient=True,
    ) as progress:

        task_id = progress.add_task(stages[0][0], total=None)

        # Run the full pipeline
        try:
            result = orchestrator.run_pipeline(target)
        except Exception as exc:
            console.print(Panel(
                f"[bold red]Pipeline error:[/] {exc}",
                border_style="red",
            ))
            sys.exit(2)

        # Advance through visual stages quickly (pipeline already ran)
        for desc, _ in stages:
            progress.update(task_id, description=desc)
            time.sleep(0.3)

    console.print()

    # ── Step 1 output: quarantine alerts ────────────────────────────
    alerts = result.get("alerts", [])
    if alerts:
        _quarantine_panel(console, alerts)

    # ── Step 2 output: vulnerability table ──────────────────────────
    scan = result.get("scan", {})
    vulns = scan.get("vulnerabilities", [])
    if vulns:
        _vuln_table(console, vulns)
    else:
        console.print(
            Panel("[green]No vulnerabilities detected — code looks clean.[/]",
                  title="🔍 Scan", border_style="green")
        )
        console.print()

    # ── Step 3 output: diff ─────────────────────────────────────────
    if result.get("patched"):
        patched_path = Path(workspace) / target
        patched_code = patched_path.read_text(encoding="utf-8") if patched_path.exists() else ""
        _diff_panel(console, original_code, patched_code, target)

    # ── Step 4 output: test result ──────────────────────────────────
    tests = result.get("tests", {})
    _test_result_panel(console, tests.get("passed", False))

    # ── Final summary ───────────────────────────────────────────────
    _summary_panel(console, result)
    console.print()


if __name__ == "__main__":
    main()
