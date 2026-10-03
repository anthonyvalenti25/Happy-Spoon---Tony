# Collaboration workflow

This project is shared through `https://github.com/anthonyvalenti25/Happy-Spoon---Tony.git`.
The user wants synchronization tied to work in the conversation, not a scheduled task.

Standing user preference: always pull the latest GitHub code before making a
change. After each prompt is complete, if repository files changed, review and
validate the changes, commit the completed work, and push it to GitHub before
reporting completion. Apply this preference in future chats for this project.
If synchronization is blocked, preserve local work and clearly report the blocker.

- At the start of each user prompt in this project, check the current branch, origin,
  working tree, and any Git operation in progress. Fetch origin and pull current
  changes before starting work when it is safe. Prefer a fast-forward pull.
- The current shared branch is `main`, tracking `origin/main`. If another branch is
  checked out, inspect its purpose instead of switching branches or merging it into
  main automatically.
- Preserve uncommitted work. Do not discard, overwrite, or commit unrelated or
  unfinished edits just to make a pull succeed. Integrate incoming changes once
  local work is safely accounted for.
- At completion of a change, review the diff, run appropriate checks, commit the
  completed work with a descriptive message, and push it to the shared branch.
  The user has authorized routine commits, pulls, merges, and pushes for this workflow.
- If the remote advances before a push, fetch, inspect both sides, merge compatible
  changes while preserving both collaborators' work, validate, and retry. Flag
  ambiguous conflicts rather than guessing. Never force-push or bypass protections.
- Do not commit credentials, secrets, temporary output, or unrelated changes.
  Deliberate deliverables such as the viewer's downloadable GLB models belong in Git.
- If a prompt produces no repository changes and there are no completed local
  commits awaiting publication, no commit or push is needed. Avoid empty commits.
- Report the result plainly: what changed, whether checks passed, and whether the
  push succeeded. A Git push alone is not evidence that a website deployment is live.
- Do not enable periodic or background synchronization unless the user requests it again.
