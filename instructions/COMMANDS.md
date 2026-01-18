# Commands

## Setup

### Initialize Spec Kit

```bash
# Using uv (recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init . --ai claude # To initialize this project
```

### Initialize Claude-Flow

```bash
npx claude-flow init --force # To initialize this project
```

## Command Templates

> Claude-Flow command template

```bash
npx claude-flow swarm "" --claude
```