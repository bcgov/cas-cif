-- Deploy cif:computed_columns/project_revision_project_managers_status to pg
-- requires: util_functions/get_form_status

begin;

create or replace function cif.project_revision_project_managers_status(cif.project_revision)
returns text
as
$computed_column$

select
    case
      when (select exists (select get_form_status from cif.get_form_status($1.id, 'project_manager') where get_form_status = 'Incomplete'))
        then 'Incomplete'
      when (select exists (select get_form_status from cif.get_form_status($1.id, 'project_manager') where get_form_status = 'Attention Required'))
          then 'Attention Required'
      when (select count(distinct get_form_status) from cif.get_form_status($1.id, 'project_manager')) = 1
        and (select (select distinct get_form_status from cif.get_form_status($1.id, 'project_manager'))) = 'Complete'
          then 'Complete'
      else 'Not Started'
    end;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_managers_status to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_managers_status is 'Computed column to return a project managers status for a project revision';

commit;
