#!/bin/bash
# Cleans all build artifacts, caches, and optionally node_modules

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Cleaning build artifacts..."
find "$ROOT_DIR/packages" -name 'dist' -type d -prune -exec rm -rf '{}' +
find "$ROOT_DIR" -name '.hashes.json' -type f -delete
find "$ROOT_DIR" -name '.turbo' -type d -prune -exec rm -rf '{}' +

if [ "$1" = "--all" ]; then
  echo "Cleaning node_modules..."
  find "$ROOT_DIR" -name 'node_modules' -type d -prune -exec rm -rf '{}' +
fi

echo "Done."
