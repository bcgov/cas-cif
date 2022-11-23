-- Deploy cif:tables/full_backup_log to pg
-- requires: schemas/private

begin;

create table cif_private.full_backup_log (
  full_backup_timestamp timestamptz not null default now()
);

comment on table cif_private.full_backup_log is 'Table to track timestamps taken before a full backup is performed. This timestamp data will be used to verify backup data';
comment on column cif_private.full_backup_log.full_backup_timestamp is 'The timestamp added before a full backup is performed';

commit;
