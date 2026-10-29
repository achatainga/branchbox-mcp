---
name: branchbox-mcp
version: 1.0.0
description: "Ephemeral CoW local database branching, dynamic port isolation & destructive-DDL firewall. Prevents AI coding agents from dropping production/staging databases or colliding on shared dev ports."
author: "Alejandro Chataing <a.chataing.a@gmail.com>"
license: "Commercial (Agensi.io Tier 1)"
price: "$39.00 USD"
marketplace: "https://www.agensi.io"
category: "Database & Backend / DevOps & SRE"
compatibility: "Claude Code, Cursor, Windsurf, Antigravity, Copilot, Amazon Q"
---

# BranchBox MCP v1.0.0 — Ephemeral CoW Database & Port Orchestrator

> *"Zero-config, sub-second Copy-on-Write local database branching and destructive DDL firewall for parallel coding agents."*

---

## ⚡ 1. MANDATE & OVERVIEW

BranchBox eliminates **Terminal Killer #2: Destructive Database Migration Wipes** and **Whitespace Zone A (Worktree Port & Database Collisions)**.

When agents run migrations during feature development, CLI tools often suggest reset flags (`--force-reset`, `migrate:fresh`, `--accept-data-loss`). Autonomous agents blindly run these flags, dropping dozens of tables in seconds. Furthermore, when multiple agents run across parallel Git worktrees, they collide on `localhost:5432` and `localhost:3000`.

BranchBox intercepts worktree creation, spins up an isolated **Copy-on-Write (CoW)** database clone in $< 50\text{ ms}$, assigns collision-free ports, and blocks destructive DDL with hard harness exit codes.

---

## 🛑 2. DETERMINISTIC HARNESS HOOKS (`hooks/hooks.json`)

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "handler": "branchbox_fork_ephemeral"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "tool == 'run_command'",
        "condition": "command.match(/(--force-reset|migrate:fresh|db:wipe|--accept-data-loss|terraform\\s+destroy)/i)",
        "action": "block",
        "exitCode": 2,
        "message": "🛑 [BRANCHBOX FIREWALL]: Destructive migration/reset flag detected. Operation blocked to prevent data loss."
      }
    ],
    "WorktreeRemove": [
      {
        "handler": "branchbox_promote_and_reap"
      }
    ]
  }
}
```

---

## 🛠️ 3. CORE MCP TOOLS

### `branchbox_fork_ephemeral`
- **Parameters:** `sourceDb` (string), `worktreeId` (string).
- **Behavior:** Provisions an isolated CoW database clone in $< 50$ms using OS file cloning or `CREATE DATABASE ... TEMPLATE`. Assigns a unique port lease (e.g., `54321`) and writes a localized `.env` file.

### `branchbox_simulate_migration`
- **Parameters:** `branchId` (string), `migrationPath` (string).
- **Behavior:** Executes the proposed schema migration inside the ephemeral clone, checking for table locks, broken foreign keys, or dropped columns before allowing production merge.

### `branchbox_time_travel_restore`
- **Parameters:** `branchId` (string), `checkpointId` (string).
- **Behavior:** Rolls back a corrupted database branch to its pre-migration state instantly.

### `branchbox_promote_and_reap`
- **Parameters:** `branchId` (string).
- **Behavior:** Cleans up the temporary branch, releases dynamic port bindings, and garbage-collects volume state.
