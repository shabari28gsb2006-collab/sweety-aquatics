#!/bin/sh
set -eu
if [ "${CONFIRM_RESTORE:-}" != "RESTORE_SWEETY_DATABASE" ]; then echo "Set CONFIRM_RESTORE=RESTORE_SWEETY_DATABASE to confirm destructive restore" >&2; exit 1; fi
if [ -z "${DATABASE_URL:-}" ] || [ -z "${1:-}" ]; then echo "Usage: restore-database.sh BACKUP.dump (DATABASE_URL required)" >&2; exit 1; fi
backup="$1"
test -f "$backup"
if [ -f "$backup.sha256" ]; then sha256sum -c "$backup.sha256"; fi
pg_restore --clean --if-exists --no-owner --no-acl --exit-on-error --dbname="$DATABASE_URL" "$backup"
