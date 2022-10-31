-- Deploy cif:tables/form to pg
-- requires: schemas/main

begin;

alter table cif.form
alter column form_change_commit_handler type varchar(10000),
alter column form_change_commit_handler set not null,
alter column form_change_commit_handler set default 'handle_default_form_change_commit';

-- note: there is no need to migrate the existing data in the columns, since our prod data deployment step overwrites it every time.

commit;
