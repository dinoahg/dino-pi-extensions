# pi-load-skills

> Fork of [bnenu/pi-load-skill](https://github.com/bnenu/pi-load-skill) by Bogdan Nenu, maintained in [dinoahg/pi-extensions](https://github.com/dinoahg/pi-extensions). It fixes skill restoration on reload, the `load_skill` tool, and `/tree` support. See [CHANGELOG](CHANGELOG.md).

Load your skills on demand from any location. Keep your [pi](https://shittycodingagent.ai) agent lean — don't load all your skills when you don't need them, add only the ones you need for that session.

## Features

- **Load skills on-demand**: Load individual skills or entire skill directories from any path
- **Session-scoped**: Skills persist in the session file and are restored automatically on `/reload`, `/resume`, `/fork`, `/tree`, and pi restart
- **Native injection**: Loaded skills appear in the system prompt with name, description, and location — the agent can read the full skill content on demand
- **Unload skills**: Remove loaded skills when no longer needed
- **Agent tool**: The agent can load/unload skills itself via the `load_skill` tool

## Installation

Not published to npm. Install from this repo:

```bash
# Local clone (edits take effect on /reload, no reinstall)
pi install /path/to/pi-extensions/pi-load-skills

# From git: installs all extensions in the repo; see the root README to pick only this one
pi install git:github.com/dinoahg/pi-extensions

# Try it for one session
pi -e /path/to/pi-extensions/pi-load-skills/extensions/load-skills.ts
```

## Usage

### Load Skills

**Load all skills from a directory:**
```
/load-skills ./path/to/skills-folder
```

**Load a single skill:**
```
/load-skills ./path/to/skill-folder
```

The extension will:
1. Find all skills in the directory (or validate a single skill)
2. Add them to pi's skill discovery system via `resources_discover`
3. They appear in the `<available_skills>` section of the system prompt with their file location
4. The agent can read the full skill content on demand using the `read` tool

### List Loaded Skills

```
/list-loaded-skills
```

### Unload Skills

**Unload a specific skill:**
```
/unload-skills skill-name
```

**Unload all loaded skills:**
```
/unload-skills
```

### Run a Loaded Skill

```
/skill:my-skill
```

### Let the Agent Load Skills

The `load_skill` tool takes `path` (and optional `unload: true`). pi can't reload while the agent is running, so the change is saved right away and pi reloads after the agent finishes its response. The tool result includes the `SKILL.md` path so the agent can read it immediately.

`/reload-skills` reloads pi so the current skills reach the system prompt. The tool and `/tree` use it; you rarely need it yourself.

## Example

```bash
# Start pi
pi

# In the pi session:
/load-skills ./my-skills

# Skills now appear in the system prompt — the agent can use them
What skills do you have available?

# Unload when done
/unload-skills
```

## How It Works

1. **On `/load-skills`**: Skills are validated, added to the in-memory map, a snapshot is appended to the session file via `pi.appendEntry()`, and pi reloads
2. **On any session transition** (`/reload`, `/resume`, `/fork`, pi restart): `session_start` fires, the extension walks the current branch from `ctx.sessionManager.getBranch()` (root→leaf) backwards, finds the newest `pi-load-skill` snapshot entry, and restores the map from it
3. **On `/new`**: A fresh session has no prior entries — the map starts empty
4. **On `/tree`**: `session_tree` fires, the map is restored from the new branch, and pi reloads if the skills changed
5. **On `load_skill` tool calls**: a snapshot is appended and pi reloads once the agent settles

## Persistence Model

| Event                  | Skills in session                           |
|------------------------|---------------------------------------------|
| `/load-skills`         | snapshot appended to session + reload triggered |
| `/unload-skills`       | snapshot appended to session + reload triggered |
| `load_skill` tool      | snapshot appended + reload after the agent finishes |
| `/reload`              | branch replayed → skills restored ✓         |
| `/new`                 | fresh session, no entries → map empty ✓     |
| `/resume`              | branch replayed → skills restored ✓         |
| `/fork`                | branch up to fork point replayed ✓          |
| pi restart + resume    | branch replayed → skills restored ✓         |
| pi restart (no resume) | fresh session → map empty ✓                 |
| `/tree`                | new branch replayed → reload if skills changed ✓ |

## Skill Format

Skills must follow the [Agent Skills standard](https://agentskills.io):

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

## Usage

Instructions for using the skill...
```

## Requirements

- pi >= 0.81.0 (tested with 1.5.2)
- Node.js >= 18

## Development

```bash
npm install
npm test
```

## Original Work

Created by [Bogdan Nenu](https://github.com/bnenu) at [bnenu/pi-load-skill](https://github.com/bnenu/pi-load-skill). Made with [reespec](https://reespec.dev) and ❤️ in EU.

## License

MIT, see [LICENSE](LICENSE).
