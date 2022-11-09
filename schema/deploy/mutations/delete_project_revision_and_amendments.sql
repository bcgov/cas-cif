-- Deploy cif:mutations/delete_project_revision_and_amendments to pg

create or replace function cif.delete_project_revision_and_amendments(revision_id integer) returns void as $$
    begin
        delete from cif.project_revision_amendment where project_revision_id = revision_id;
        delete from cif.project_revision where id = revision_id;
    end;
$$ LANGUAGE plpgsql;
