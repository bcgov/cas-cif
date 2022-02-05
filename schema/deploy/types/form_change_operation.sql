-- Deploy cif:types/form_change_operation to pg

begin;

create type cif.form_change_operation as enum (
  'create',
  'update',
  'archive'
);

comment on type cif.form_change_operation is 'The type of change operation, defining the action taken when the form_change is committed.';

commit;
