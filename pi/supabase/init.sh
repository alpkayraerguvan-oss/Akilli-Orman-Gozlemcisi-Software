#!/bin/sh
# May be sourced (non-executable) or run (executable) by the postgres
# entrypoint, so avoid `set -e`/`set -u` here and check manually instead.

if [ -z "${AOG_AUTHENTICATOR_PASSWORD:-}" ]; then
  echo "init.sh: AOG_AUTHENTICATOR_PASSWORD is required" >&2
  exit 1
fi

psql -v ON_ERROR_STOP=1 -v authpw="$AOG_AUTHENTICATOR_PASSWORD" \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f /docker-entrypoint-initdb.d/init.sql.template || exit 1
