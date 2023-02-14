-- Revert cif:tables/project_revision_005_correct_revision_type from pg

begin;

-- one-way migration, no revert necessary.

commit;
