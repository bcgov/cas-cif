-- Revert cif:tables/project_001 from pg

begin;

/** The revert for project_001 should already have been run in computed_columns/form_change_as_project as the columns need to be
    dropped for the function to properly be reverted. This revert will only be called in a development context where sqitch
    only got deployed to project_001.
**/
alter table cif.project drop column if exists score, drop column if exists project_type;

commit;
