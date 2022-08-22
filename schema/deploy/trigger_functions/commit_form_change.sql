-- Deploy cif:trigger_functions/commit_form_changes to pg
-- requires: schemas/private

begin;

drop trigger if exists commit_form_change on cif.form_change;
drop function if exists cif_private.commit_form_change();

commit;
