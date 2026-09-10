# Conventions for this repo

This repo is one Claude Code plugin whose only content is skills. Read this before adding or editing one.

## Layout

Every skill is one directory under `skills/`, holding a `SKILL.md`. The directory name and the frontmatter `name` must match, and both are kebab-case.

```
skills/
  new-skill/
    SKILL.md
    references/        optional, loaded only when SKILL.md points at it
```

There are no bucket folders. If the repo passes roughly 15 skills and the list stops being scannable, that is the moment to introduce buckets, not before.

## Registration is automatic

Claude Code always scans a plugin's `skills/` directory, and `plugin.json`'s `skills` field only adds paths on top of that scan. So `plugin.json` deliberately has no `skills` field: creating the directory is the whole registration step. Do not add one, and do not list `./skills/` there, because that path is already scanned.

The one thing a new skill does need is a row in the `README.md` index. `scripts/check-skills.sh` fails if a skill is missing from it.

## Frontmatter

Required:

```yaml
---
name: kebab-case-name
description: One line. See the rule below.
---
```

Optional: `argument-hint` for a user-invoked skill that takes arguments, and `allowed-tools` to narrow what the skill may call.

## Who can invoke it

Two kinds, and the `description` is written differently for each.

**Model-invoked** is the default. Omit `disable-model-invocation`. The description is written for the model, so it carries the trigger phrasing that makes auto-invocation fire: what the user wants, mentions, or asks for. Choose this when the model could usefully reach for the skill on its own.

**User-invoked** means only the human can fire it, by typing its name. Set `disable-model-invocation: true`. The description is written for a person scanning a slash-command list, so strip the trigger phrases and just say what it does. Choose this for a skill that starts a long or expensive run, or one that should never fire as a side effect of something else.

A user-invoked skill cannot be reached by another skill. When a skill depends on one, write the step as an instruction for the human ("tell the user to run `/setup-x`"), never as a tool call.

To have one skill call another, name the tool: `Call the Skill tool with "unslop"`. A bare `/unslop` in prose gets read as a label, not a command. One skill per call.

## Writing the body

Keep `SKILL.md` short enough to stay cheap in context. It is loaded in full every time the skill fires.

Write instructions for an agent, not documentation for a person. Say what to do, in what order, and what counts as done. Give the failure modes by name, since a named anti-pattern is what an agent can actually check itself against.

Move anything long into a `references/` file and link it from the body, so it loads only when the step needs it. Long checklists, examples, rubrics, and prompt text all belong there.

## Prose rules

No em-dashes anywhere in this repo. Rewrite the sentence with a comma, a period, parentheses, or a conjunction, whichever the sentence wants. Never swap the character for a hyphen.

Sentence case headings. No decorative emoji. Straight quotes.

## Before you commit

```bash
scripts/check-skills.sh
claude plugin validate . --strict
```

The first checks frontmatter, name matching, em-dashes, and the README index. The second checks the plugin and marketplace manifests.
