#!/usr/bin/env bash
# Symlinks every skill in this repo into ~/.claude/skills, so a git pull keeps
# the installed copies current. This is for working on the repo. Anyone else
# should install the plugin instead (see README.md).
#
#   scripts/link-skills.sh            link, refusing to touch real directories
#   scripts/link-skills.sh --dry-run  print what it would do
#   scripts/link-skills.sh --force    replace real directories too
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

dry=0
force=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry=1 ;;
    --force) force=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ -L "$DEST" ]; then
  resolved="$(readlink "$DEST")"
  case "$resolved" in
    "$REPO"|"$REPO"/*)
      echo "error: $DEST is a symlink into this repo ($resolved)." >&2
      echo "Remove it and re-run, so the script can create a real directory." >&2
      exit 1
      ;;
  esac
fi

run() {
  if [ "$dry" -eq 1 ]; then
    echo "would: $*"
  else
    "$@"
  fi
}

[ "$dry" -eq 1 ] || mkdir -p "$DEST"

shopt -s nullglob
skipped=0
for src in "$REPO"/skills/*/; do
  src="${src%/}"
  [ -f "$src/SKILL.md" ] || continue
  name="$(basename "$src")"
  target="$DEST/$name"

  if [ -e "$target" ] && [ ! -L "$target" ]; then
    if [ "$force" -eq 1 ]; then
      echo "replacing real directory $target"
      run rm -rf "$target"
    else
      echo "skipping $name: $target is a real directory, not a link. Move it into this repo, or re-run with --force to replace it." >&2
      skipped=$((skipped + 1))
      continue
    fi
  fi

  run ln -sfn "$src" "$target"
  echo "linked $name -> $src"
done

if [ "$skipped" -gt 0 ]; then
  echo "$skipped skill(s) skipped." >&2
  exit 1
fi
