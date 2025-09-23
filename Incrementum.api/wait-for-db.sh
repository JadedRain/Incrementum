#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

echo "Waiting for Postgres at $host..."

until pg_isready -h "$host" -p 5432 > /dev/null 2>&1; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
