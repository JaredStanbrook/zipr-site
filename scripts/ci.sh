#!/usr/bin/env bash
# The whole of CI, as one script: run it on the build VM by hand, or let the
# CI workflow run it (Actions → CI → Run workflow) on a self-hosted runner.
# The workflow is only this script, so there is no second list to drift.
#
#   scripts/ci.sh               stop at the first failure
#   scripts/ci.sh --keep-going  run every step, then list what failed
#
# Needs Node (.node-version) and npm. Deployment is not here: Cloudflare's Git
# integration builds and deploys on push, on Cloudflare's machines.
set -uo pipefail

cd "$(dirname "$0")/.."

keep_going=0
for arg in "$@"; do
  case "$arg" in
    --keep-going) keep_going=1 ;;
    *) echo "usage: scripts/ci.sh [--keep-going]" >&2; exit 2 ;;
  esac
done

failed=()
summary() {
  echo
  if [ "${#failed[@]}" -eq 0 ]; then
    printf '\033[32m✓ CI: every step passed\033[0m\n'
  else
    printf '\033[31m✗ CI: %d step(s) failed\033[0m\n' "${#failed[@]}"
    printf '  - %s\n' "${failed[@]}"
  fi
}
step() {
  local title="$1"
  shift
  printf '\n\033[1m▶ %s\033[0m\n' "$title"
  if "$@"; then
    return 0
  fi
  failed+=("$title")
  printf '\033[31m✗ %s\033[0m\n' "$title"
  if [ "$keep_going" -eq 0 ]; then
    summary
    exit 1
  fi
}

# Only in the template repository itself, so it disappears in sites made
# from it. The template once got configured for a real site by mistake, which
# meant the next site inherited a live database id and its first deploy
# migrated someone else's data.
template_placeholders() {
  case "$(git remote get-url origin 2>/dev/null)" in
    *frug-template*) ;;
    *) echo "not the template repository; nothing to check"; return 0 ;;
  esac
  local missing=0
  for token in \
    '"name": "frug-app"' \
    '"database_name": "change-me-db"' \
    '"database_id": "00000000-0000-0000-0000-000000000000"' \
    '"id": "00000000000000000000000000000000"' \
    '"bucket_name": "change-me-files"'; do
    if ! grep -qF "$token" wrangler.jsonc; then
      echo "Missing placeholder in wrangler.jsonc: $token"
      missing=1
    fi
  done
  if [ "$missing" -ne 0 ]; then
    echo "The template must ship placeholders only. Configure the repo made FROM the template."
    return 1
  fi
}

# The licences of everything shipped to the browser, served at
# /third-party-notices.txt. Regenerated and compared, so a dependency change
# that forgets `npm run notices` fails here rather than shipping code without
# its licence.
notices() {
  npm run notices > /dev/null &&
    git diff --exit-code -- public/third-party-notices.txt ||
    { echo "public/third-party-notices.txt is stale: run 'npm run notices' and commit it."; return 1; }
}

step "Dependencies" npm ci
step "Template placeholders intact" template_placeholders
step "Lint" npm run lint
step "Formatting" npm run format
step "Third-party notices up to date" notices
# `npm run build` runs `wrangler types` first, so worker-configuration.d.ts
# exists before tsc needs it.
step "Typecheck and build" npm run build
step "Tests" npm run test

summary
[ "${#failed[@]}" -eq 0 ]
