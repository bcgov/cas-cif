-- Deploy cif:data_migration/data_migration_add_general_revision to pg

BEGIN;
begin;

create or replace function cif.add_general_revision()
  returns void as $$
declare
  temp_row record;
begin
    alter table cif.project_revision disable trigger _100_committed_changes_are_immutable;

    for temp_row in
      select id from cif.project_revision
     loop
      update cif.project_revision
      set revision_type='General Revision';
    end loop;

    alter table cif.project_revision enable trigger _100_committed_changes_are_immutable;
end;
$$ language plpgsql volatile;

-- Data migration: add 'General Revision' revision type to all existing project revisions
select cif.add_general_revision();

commit;
