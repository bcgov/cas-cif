-- Deploy cif:functions/migration_attachment_table_to_project_attachment_table to pg
-- requires: tables/attachment
-- requires: tables/project_attachment

begin;

create or replace function cif_private.migration_attachment_table_to_project_attachment_table()
returns void as
$migration$

  insert into cif.project_attachment (project_id, attachment_id)
  select a.project_id, a.id
  from cif.attachment a
  where not exists (
    select 1 from cif.project_attachment pa
    where pa.project_id = a.project_id
    and pa.attachment_id = a.id
);

$migration$ language sql volatile;

commit;
