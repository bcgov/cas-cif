-- Deploy cif:mutations/delete_project_revision to pg
begin;
create or replace function cif.delete_project_revision(revision_id integer) returns void as $$
        delete from cif.project_revision_amendment_type where project_revision_id = revision_id;
        delete from cif.project_revision where id = revision_id;
$$ LANGUAGE sql;
grant execute on function cif.delete_project_revision to cif_internal, cif_external, cif_admin;
commit;
