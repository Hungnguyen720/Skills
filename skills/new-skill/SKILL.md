---
name: new-skill
description: Author a new skill in this repo, or fix an existing one. Use when the user wants to write, create, add, scaffold, split, or review a skill, mentions making a workflow reusable, says "turn this into a skill", or asks why a skill is not firing.
---

# New skill

Turn a repeated piece of work into a skill in this repo. The output is one directory under `skills/`, a row in the `README.md` index, and a passing check.

Read `AGENTS.md` at the repo root first. It holds the layout, frontmatter, and prose rules that this skill applies.

## Before writing anything, settle three things

**Is it one skill?** A skill is one job with one entry point. If the answer to "when does this fire" needs the word "or", it is probably two skills. Split it.

**Who invokes it?** Model-invoked unless the skill starts a long or expensive run, or would do damage if it fired as a side effect. That choice changes how the description is written, so make it now, not after.

**What does the agent get wrong today?** Write that down. It is the reason the skill exists, and it tells you which anti-patterns the body has to name. A skill that only restates what the model already does well is a skill that burns context for nothing.

Ask the user for whichever of the three you cannot answer from what they gave you.

## Write it

1. Pick a kebab-case name that reads as the job, not the topic. `to-tickets` beats `ticket-helper`.
2. Create `skills/<name>/SKILL.md` with `name` matching the directory.
3. Write the description. This single line decides whether the skill ever fires, so see [references/descriptions.md](references/descriptions.md).
4. Write the body as ordered instructions for an agent. Say what to do, what counts as done, and which failure modes to avoid by name.
5. Move anything long into `references/<topic>.md` and link it from the body. Rubrics, examples, checklists, and prompt text go there so they load only when the step needs them.
6. Add a row to the `README.md` index, under the matching heading.

## Then check it

```bash
scripts/check-skills.sh
claude plugin validate . --strict
```

Both must pass. If the skill should also be available outside the plugin, run `scripts/link-skills.sh` to symlink it into `~/.claude/skills`.

## Anti-patterns

- **Documentation, not instruction.** The body explains a concept instead of telling the agent what to do. If a line does not change an action, cut it.
- **A description with no triggers.** A model-invoked skill described as "Helps with tickets" never fires. The description has to contain the words a user actually says.
- **Everything in `SKILL.md`.** The whole file loads on every invocation. A 400-line body is a tax paid every time.
- **The kitchen-sink skill.** Six jobs behind one name means the model picks the wrong one. One job, one entry point.
- **Untested prose.** A skill nobody has run once is a guess. Fire it on a real task before committing.
