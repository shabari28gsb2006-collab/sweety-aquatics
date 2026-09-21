#!/bin/sh
set -eu
if [ -z "${DATABASE_URL:-}" ]; then echo "DATABASE_URL is required" >&2; exit 1; fi
backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$backup_dir/sweety-$timestamp.dump"
pg_dump --format=custom --no-owner --no-acl --file="$target" "$DATABASE_URL"
pg_restore --list "$target" >/dev/null
sha256sum "$target" > "$target.sha256"
echo "$target"
