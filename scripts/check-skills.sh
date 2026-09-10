#!/usr/bin/env bash
# Checks every skill against the conventions in AGENTS.md:
#   - SKILL.md has YAML frontmatter with name and description
#   - frontmatter name is kebab-case and matches the directory name
#   - the skill has a row in the README.md index
#   - no em-dashes or en-dashes in any markdown file
# Reports every failure, then exits 1 if there was one.
set -uo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

fail=0
err() { printf 'FAIL %s\n' "$1" >&2; fail=1; }

shopt -s nullglob
skills=(skills/*/)
if [ ${#skills[@]} -eq 0 ]; then
  err "skills/: no skills found"
fi

for dir in "${skills[@]}"; do
  dir="${dir%/}"
  name="$(basename "$dir")"
  md="$dir/SKILL.md"

  if [ ! -f "$md" ]; then
    err "$dir: no SKILL.md"
    continue
  fi

  if [ "$(head -n 1 "$md")" != "---" ]; then
    err "$md: does not start with a --- frontmatter delimiter"
    continue
  fi

  fm="$(sed -n '2,/^---$/p' "$md" | sed '$d')"
  fm_name="$(printf '%s\n' "$fm" | sed -n 's/^name:[[:space:]]*//p' | head -n 1)"
  fm_desc="$(printf '%s\n' "$fm" | sed -n 's/^description:[[:space:]]*//p' | head -n 1)"

  if [ -z "$fm_name" ]; then
    err "$md: frontmatter has no name"
  elif [ "$fm_name" != "$name" ]; then
    err "$md: frontmatter name '$fm_name' does not match directory '$name'"
  elif ! printf '%s' "$fm_name" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$'; then
    err "$md: name '$fm_name' is not kebab-case"
  fi

  if [ -z "$fm_desc" ]; then
    err "$md: frontmatter has no description"
  fi

  if ! grep -qF "skills/$name/SKILL.md" README.md; then
    err "README.md: no index row linking skills/$name/SKILL.md"
  fi
done

# Built with printf so this file does not itself contain the characters it bans.
em="$(printf '\xe2\x80\x94')"
en="$(printf '\xe2\x80\x93')"
while IFS= read -r -d '' f; do
  hits="$(grep -nF -e "$em" -e "$en" "$f" || true)"
  if [ -n "$hits" ]; then
    err "$f: contains an em-dash or en-dash"
    printf '%s\n' "$hits" | sed 's/^/       /' >&2
  fi
done < <(find . -type f -name '*.md' -not -path './node_modules/*' -not -path './.git/*' -print0)

if [ "$fail" -eq 0 ]; then
  echo "OK: ${#skills[@]} skill(s) pass"
fi
exit "$fail"
