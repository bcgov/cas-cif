#!/usr/bin/env bash

set -e

database=${PGDATABASE:-cif}
user=${PGUSER:-$(whoami)}
host=${PGHOST:-localhost}
port=${PGPORT:-5432}

# =============================================================================
# Usage:
# -----------------------------------------------------------------------------
usage() {
    cat << EOF
$0 [-h]

Options

  -h, --help
    Prints this message

EOF
}

if [ "$#" -gt 0 ]; then
    echo "Passed $# parameters. Expected 0."
    usage
    exit 1
fi

__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
pushd "$__dirname" > /dev/null

_psql() {
  psql -d "$database" -h "$host" -p "$port" -U "$user" -qtA --set ON_ERROR_STOP=1 "$@" 2>&1
}

deployProdData() {
  _psql -f "./prod/001_form.sql"
  return 0;
}

deployProdData
