-- Deploy cif:data_migration/data_migration_add_general_revision to pg

begin;

create or replace function cif.add_general_revision()
  returns void as $$

    alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

update cif.project_revision set revision_type = 'General Revision'

    alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

$$ language sql volatile;

-- Data migration: add 'General Revision' revision type to all existing project revisions
select cif.add_general_revision();

commit;
