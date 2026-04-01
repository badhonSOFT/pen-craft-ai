#!/usr/bin/env bash
set -euo pipefail

APP_NAME="pen-craft-ai"
PORT="4173"
ALLOW_DIRTY="false"
SKIP_PULL="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --allow-dirty)
      ALLOW_DIRTY="true"
      shift
      ;;
    --skip-pull)
      SKIP_PULL="true"
      shift
      ;;
    --app-name)
      APP_NAME="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./deploy.sh [--allow-dirty] [--skip-pull] [--app-name NAME] [--port PORT]"
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Deploy started at $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

git rev-parse --is-inside-work-tree >/dev/null 2>&1

if [[ "$ALLOW_DIRTY" != "true" ]]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Working tree has uncommitted changes. Commit/stash first, or re-run with --allow-dirty."
    exit 1
  fi
fi

if [[ "$SKIP_PULL" != "true" ]]; then
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  echo "==> Pulling latest changes for branch: $CURRENT_BRANCH"
  git pull --ff-only origin "$CURRENT_BRANCH"
else
  echo "==> Skipping git pull"
fi

echo "==> Installing dependencies"
npm install

echo "==> Building project"
npm run build

echo "==> Starting/restarting PM2 app: $APP_NAME on port $PORT"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 serve dist "$PORT" --name "$APP_NAME" --spa
fi

echo "==> Saving PM2 process list"
pm2 save

echo "==> Deployment finished successfully"
pm2 status "$APP_NAME"
