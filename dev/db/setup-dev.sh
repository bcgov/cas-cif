#!/bin/sh
# Script to seed postgres data
# - must be run after sqitch
# - assumes you started postgres with the docker-compose file at root
# - command to run: `docker exec -it cas-cif_db_1 bash < setup-dev.sh`
su postgres
cd schema
for f in *.sql;
do
    psql cif < "$f"
done
