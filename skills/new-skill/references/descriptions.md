# Writing the description

The description is the only part of a skill the model sees before deciding whether to load it. Everything else in `SKILL.md` is invisible until it fires.

## Model-invoked

Say what the skill does, then list the phrases a user actually types. Cover the synonyms, because the model matches on them.

Good:

```yaml
description: Write, review, restructure, and split ClickUp tasks so they are readable by humans and executable by AI coding agents. Use when the user asks to write, draft, review, score, improve, rewrite, condense, or split a ClickUp task, ticket, story, work item, bug report, or spike, or mentions making tasks "agent-ready" or "AI-friendly".
```

Bad:

```yaml
description: Helps with ClickUp tasks.
```

The second one never fires. It names a topic, not an occasion.

Rules that hold:

- Lead with the job in plain verbs.
- Include the user's vocabulary, not yours. If people on your team say "ticket" and you wrote "work item", the skill misses.
- Name the boundary when two skills sit near each other, so the model can tell them apart. "Edits the ticket only, never touches source" is a boundary.
- Skip what the skill does not do, unless a neighbouring skill makes it ambiguous.

## User-invoked

The reader is a person scanning a list of slash commands, so drop the trigger phrases and write one line of plain description.

```yaml
description: Provisions one run's worktree, branch, and lock from a task ID, then reports them.
disable-model-invocation: true
```

## A test for either kind

Cover the body and read only the description. Can you say when this should fire, and when it should not? If not, rewrite it.
