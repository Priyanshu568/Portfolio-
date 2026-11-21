# ⚡ AegisCLI

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Gemini](https://img.shields.io/badge/Gemini_2.5-Powered-orange?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)
![DevSecOps](https://img.shields.io/badge/DevSecOps-Zero--Trust-red)

**A zero-trust, multi-agent DevSecOps engineer powered by Gemini.**

AegisCLI reads your source code, quarantines prompt-injection attempts, scans for OWASP vulnerabilities using a Gemini-powered scanner agent, generates and applies patches with a patcher agent, and verifies the fix by running your test suite — all in a single auditable pipeline.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     AegisCLI Pipeline                        │
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐           │
│  │  SECURE    │──▶│  SCANNER   │──▶│  PATCHER   │           │
│  │  READ      │   │  AGENT     │   │  AGENT     │           │
│  │            │   │ (Flash)    │   │  (Pro)     │           │
│  └────────────┘   └────────────┘   └─────┬──────┘           │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  ┌────────────┐                    ┌────────────┐           │
│  │ GUARDRAILS │                    │  VERIFIER  │           │
│  │  ENGINE    │                    │  (pytest)  │           │
│  │ ┌────────┐ │                    └────────────┘           │
│  │ │Quarantn│ │                                              │
│  │ │Path Val│ │          ┌──────────────────┐               │
│  │ │Cmd Gate│ │          │  audit_log.jsonl  │               │
│  │ └────────┘ │◀─────────│  (JSONL Ledger)  │               │
│  └────────────┘          └──────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd aegis-cli

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your Gemini API key
export GEMINI_API_KEY="your-api-key-here"      # macOS/Linux
set GEMINI_API_KEY=your-api-key-here            # Windows CMD
$env:GEMINI_API_KEY="your-api-key-here"         # PowerShell

# 4. Run the audit
python -m aegis.cli audit ./demo_repo app.py
```

You'll see AegisCLI:
1. **Quarantine** the embedded prompt injection in `app.py`
2. **Scan** for SQL injection and other OWASP vulnerabilities
3. **Patch** the vulnerable code with parameterized queries
4. **Verify** the fix by running `pytest`

### Reset the Demo

```bash
git checkout -- demo_repo/app.py
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| LLM | Gemini 2.5 Flash & Pro |
| Framework | Google Gen AI SDK |
| Language | Python 3.10+ |
| Security | Zero-Trust Policy Engine |
| Testing | pytest |
| Output | Rich terminal UI |
| Domain | DevSecOps |

---

> **Built for the Google AI Hackathon** — demonstrating agentic AI applied to real-world software security.
