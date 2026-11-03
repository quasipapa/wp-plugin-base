# Use the wp-plugin-base agent skill

<a id="skills-001"></a>

The skill lives in [quasipapa/wp-plugin-base-skill](https://github.com/quasipapa/wp-plugin-base-skill)
(Agent Skills 1.0 format) and works with Codex, Vibe and other agents that
support that format. The template repo remains the authoritative source; the
skill is a thin wrapper around it.

## Install

```bash
# project-local (recommended): commit .vibe/skills/ or .agents/skills/
mkdir -p .agents/skills
# then copy the skill folder, or use your agent's skill installer, e.g.:
npx skills add quasipapa/wp-plugin-base-skill
```

## Commands

| Command | What it does |
| --- | --- |
| `create` | Generates a new plugin repo from the template and runs `init-template.mjs` with your answers. |
| `audit` | Runs the base audit (see [upgrade guide](upgrade.md)): drift, local modifications, available base releases. |
| `upgrade` | Applies a base release to the managed files on a branch and opens a PR. |

## Relationship to WordPress/agent-skills

The skill covers only the **base lifecycle** (create/audit/upgrade). Generic
WordPress development knowledge — blocks, plugins, wp-env, REST, Plugin
Directory guidelines — comes from the upstream
[WordPress/agent-skills](https://github.com/WordPress/agent-skills), which the
generated `AGENTS.md` references. Note that the upstream skills target
WordPress 7.0+; check your own version matrix (`docs/development/versions.md`)
before applying version-specific advice.
