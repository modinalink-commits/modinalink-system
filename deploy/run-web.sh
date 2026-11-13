#!/bin/sh
# Runs inside node:20-alpine. Fetches the frontend from GitHub, builds, serves on :3000.
set -e
REPO=modinalink-commits/modinalink-system
rm -rf /app && mkdir -p /app
wget -qO- "https://codeload.github.com/$REPO/tar.gz/refs/heads/main" | tar xz -C /app --strip-components=2 "modinalink-system-main/frontend"
cd /app
npm ci --include=dev --no-audit --no-fund
npm run build
exec npm start
