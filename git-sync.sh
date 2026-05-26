#!/usr/bin/env bash
set -e

# Ensure the script runs from the git root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Error: Not a git repository."
  exit 1
}
cd "$GIT_ROOT"

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null) || {
  echo "Error: Unable to detect current branch."
  exit 1
}

echo "Syncing branch '$BRANCH' with origin..."

git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: auto sync changes"
else
  echo "No local changes to commit."
fi

git pull --rebase origin "$BRANCH"
git push origin "$BRANCH"

echo "Branch '$BRANCH' successfully synced with origin."
