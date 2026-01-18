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
