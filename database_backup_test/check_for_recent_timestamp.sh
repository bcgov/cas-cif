#!/usr/bin/env bash
set -xeuo pipefail

declare -i VALUE
VALUE=$(psql -qtAX -d cif -c "select count(*) from cif_private.full_backup_log where full_backup_timestamp > now() - interval '1 day'")

if [[ $VALUE -lt 1 ]] ; then
  echo 'no timestamp found'
  exit 1
else
  echo 'timestamp found, backup ok'
  exit 0
fi;
