#!/usr/bin/env bash
# Fabrique l'archive du plugin, prête à téléverser dans WordPress.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node "$ROOT/build/build-wordpress.js"

mkdir -p "$ROOT/dist"
rm -f "$ROOT/dist/koacher-landing.zip"
cd "$ROOT/wordpress"
zip -rq "$ROOT/dist/koacher-landing.zip" koacher-landing -x '*.DS_Store'
echo "✓ dist/koacher-landing.zip ($(du -h "$ROOT/dist/koacher-landing.zip" | cut -f1))"
