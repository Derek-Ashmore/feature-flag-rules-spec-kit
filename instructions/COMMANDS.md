# Commands

## Setup

### Initialize Spec Kit

```bash
# Using uv (recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init . --ai claude # To initialize this project
```

> Note that when installing Git Spec into your project, you *must* choose either PowerShell or ```sh```. Apparently, you can't do both.

### Initialize Claude-Flow

```bash
npx claude-flow init --force # To initialize this project
```

## Command Templates

> Claude-Flow command template

```bash
npx claude-flow swarm "" --claude
```

## Establish Git Spec Constitution

Within Claude, execute

```
/speckit.constitution
```

Claude will issue several prompts for more details.

## Establish Git Spec Specification

Within Claude, execute

```
/speckit.specify A simple, static rules engine that determines which features are enabled for a user based on their plan, region, and user ID. Rule definitions are authored in YAML. The engine evaluates flags against a user context containing userId, plan (free/pro/enterprise), and region (ISO country codes). Rules use AND logic where all conditions must match. Supports allowlist and blocklist targeting by user ID. Returns boolean values. This establishes the foundation for the feature flag rules engine library.
```