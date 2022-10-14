-- Deploy cif:computed_columns/project_revision_type_row_number to pg
-- requires: tables/project
-- requires: tables/project_revision

begin;

create or replace function cif.project_revision_type_row_number(project_revision cif.project_revision)
returns integer
as
$computed_column$
  select row_number from (select *, row_number() over (partition by revision_type order by id) from cif.project_revision where project_id = $1.project_id) as t where id = $1.id;
$computed_column$ language sql stable;

comment on function cif.project_revision_type_row_number(project_revision cif.project_revision) is 'Returns the row number of the project revision within the scope of a project and among all other revisions of the same type.';

commit;
