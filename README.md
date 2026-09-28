# Skills

Agent skills I use for real work, packaged as a Claude Code plugin.

Each skill is a directory under [`skills/`](./skills) holding a `SKILL.md`: instructions an agent loads when the job comes up, so I stop re-explaining the same workflow every session.

## Install

```bash
claude plugin marketplace add Hungnguyen720/Skills
claude plugin install hung-skills@hungnguyen720
```

Or, from inside a session:

```
/plugin marketplace add Hungnguyen720/Skills
/plugin install hung-skills@hungnguyen720
```

The repo is its own marketplace, so there is nothing else to configure. Run `claude plugin marketplace update hungnguyen720` to pull later changes.

## The skills

### Model-invoked

Reachable by the model or by name, so they fire on their own when the job comes up.

| Skill | What it does |
| --- | --- |
| [app-map](./skills/app-map/SKILL.md) | Map an app as one local HTML page: wireframed screens whose buttons trace to actions, domains, tables and events. Extracts the map from a codebase, or plans a new app or change through a walkthrough. |
| [new-skill](./skills/new-skill/SKILL.md) | Author a new skill in this repo, or fix one that is not firing. |

### User-invoked

Reachable only by typing the name. Nothing here yet.

## Working on the repo

```bash
git clone https://github.com/Hungnguyen720/Skills.git
cd Skills
scripts/check-skills.sh          # frontmatter, name matching, README index, prose rules
claude plugin validate . --strict
```

To use the working copy instead of the installed plugin, symlink the skills into `~/.claude/skills`:

```bash
scripts/link-skills.sh --dry-run   # see what it would do
scripts/link-skills.sh
```

Every entry is a symlink into the repo, so a `git pull` updates the installed skills. The script refuses to overwrite a real directory already sitting in `~/.claude/skills`, since that is usually a skill that lives nowhere else yet. Move it into the repo, or pass `--force`.

## Conventions

[AGENTS.md](./AGENTS.md) holds the rules: layout, frontmatter, how to decide whether a skill is model-invoked or user-invoked, how to write a body an agent can follow, and the prose rules. `scripts/check-skills.sh` enforces the mechanical half.

Adding a skill is two steps: create `skills/<name>/SKILL.md`, then add a row to the table above. Claude Code always scans a plugin's `skills/` directory, so there is no manifest to edit.

## Credits

Shaped by two repos worth reading:

- [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, for the flat layout, principle names used as steering vocabulary, and the argument that a prototype beats a plan.
- [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock, for the invocation split, the reference-file pattern, and the discipline of a router that has to stay honest.

## License

MIT
