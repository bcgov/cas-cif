-- Deploy cif:tables/change_status to pg

begin;

create table cif.change_status (
  status varchar(1000) primary key,
  triggers_save boolean default false,
  active boolean default true
);

select cif_private.upsert_timestamp_columns('cif', 'change_status');

-- no RLS, these are static

comment on table cif.change_status is 'Table containing the different status that a change can have';
comment on column cif.change_status.status is 'The name of the status, e.g. "pending", "saved", ...';
comment on column cif.change_status.triggers_save is 'Whether that status should trigger a save of the record described by the change';
comment on column cif.change_status.active is 'Whether that status is active';

insert into cif.change_status (status, triggers_save, active)
values
  ('pending', false, true),
  ('saved', true, true);

commit;
