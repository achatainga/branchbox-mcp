# BranchBox MCP

> Ephemeral Copy-on-Write Database Branching & Destructive Migration Firewall for Autonomous Coding Agents.

[![MCP 2026-07-28](https://img.shields.io/badge/MCP-2026--07--28-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## The Problem
When autonomous agents (Claude Code, Cursor, Windsurf, Devin) run database tasks, they frequently wipe shared development databases or collide on ports:
1. **Destructive DDL**: An agent executes `prisma db push --force-reset`, `artisan migrate:fresh`, or `DROP DATABASE`, destroying mock data and credentials.
2. **Port Collisions**: Multi-agent sessions or parallel branches crash with `EADDRINUSE: 5432`.
3. **Dirty State**: Agent fails halfway through a migration, leaving tables in an unrecoverable corrupted state.

## The Solution
BranchBox MCP is a hybrid moat tool that pairs a **PreToolUse Firewall** with **Stateless CoW Database Branching**:
- **Destructive DDL Interceptor**: Hard-blocks commands containing `migrate:fresh`, `--force-reset`, `db:wipe`, or naked `DROP DATABASE` via exit code 2.
- **Instant CoW Sandbox**: Allocates ephemeral PostgreSQL/MySQL clones on dedicated non-colliding ports (`54320-54399`) per git worktree.
- **Auto-Rollback on Crash**: Drops ephemeral schemas when an agent aborts or the worktree is destroyed.

## Architecture

```
[Agent Shell / MCP Client]
            |
            v  (PreToolUse Hook)
+-----------------------------------+
|  Destructive DDL Firewall (exit 2)| ---> Blocked if --force-reset or migrate:fresh
+-----------------------------------+
            | (Clean)
            v
+-----------------------------------+
|   BranchBox CoW Socket Engine     |
|   - Dynamic port 54320-54399      |
|   - Template DB CoW snapshot      |
|   - Git worktree lifecycle hooks  |
+-----------------------------------+
```

## Tools Provided

### `create_branch_db`
Provisions an isolated ephemeral database branch for the current git worktree with dedicated credentials and non-colliding port.

### `inspect_migration_safety`
Scans SQL or ORM migration files for destructive operations (`DROP COLUMN`, `RENAME TABLE` without view backfill) and returns structured mitigation plans.

### `destroy_branch_db`
Tears down the ephemeral database container or schema once the agent completes verification.

## Testing & Verification
Run the verification suite:
```bash
node tests/run_live_test.mjs
```

## License
MIT © 2026 BranchBox Systems
