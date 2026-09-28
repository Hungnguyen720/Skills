# Plan an app or a change

The map starts empty, or from an extracted map, and grows round by round. The owner decides, and Claude draws, recommends and keeps the map consistent.

## First round: the frame

Ask about only what the request leaves open. Most of it can come from one message from the owner.

1. Who uses the app, and on what device. This sets `APP.user`, and decides whether screens get desktop frames, phone frames or both.
2. The jobs. Write three to seven `APP.jobs` rows, as `[what they want to do, where, how often]`. The most frequent job decides the home page.
3. The places. Draft `APP.nav` from the jobs. Aim for four to six items. Show the owner the nav with one recommendation, and ask only if a real choice is left.
4. What the app is compared against. If the owner names a competitor or an existing tool, use it to check scope. Don't copy its screens.

Write `APP`, `screenGroups` with one group per nav item, and empty screen files. Everything is `planned`.

## Then one screen group per round

For each group, in the order the user meets them:

1. Sketch the screens for the main journey only. Use real words for headings, buttons and column names. Use bars for everything else.
2. For each button, add an action. Give it to the domain that owns the data it changes. Create a domain when no existing one owns that data.
3. When an action changes another domain's data, add a domain event and a handler in that domain. Pick `same` when the change must succeed or fail with the action, and `deferred` for anything that can happen a moment later, such as email.
4. Run the check and look at the page.
5. Send the owner the link and the questions for this group. Ask only the questions whose answer changes the map. Give two to four options per question, with the simplest first and marked "(Recommended)".
6. Apply the answers. Put each one on the note, word or gap it affects, ending in "(decided YYYY-MM-DD)". Move settled questions out of `questions`.

Hold questions about other screen groups until their round. Keep them in those screens' `questions` in the meantime.

## Keeping it small

- Recommend the fewest screens, fields and rows that do the job. A new status or field needs a job that uses it.
- If the owner doesn't understand a term, rename it or remove it. Log the new word in `words`.
- Park error paths, edit flows and rare cases as questions until the main flow is agreed. The owner can ask for them later.
- A thing nobody plans yet goes in `gaps` with its reason, not onto a screen.

## Planning a change to an existing app

Start from an extracted map, so actions marked `exists` show what's built. Add the change as planned actions and screens, or as notes on existing screens. The Status page then shows how much is new. For a change that replaces an old action, give the new one `before` with the old operation's name.

## Finishing

When every screen group has had a round:

- Walk through each flow once in the browser, from the Tour page.
- Check Status. It should have no actions without a button, and every gap should have a reason.
- Tell the owner the map is ready to become canonical. Then ask whether to create tickets from the planned actions, and how to group them. Don't create them until the owner says yes.
