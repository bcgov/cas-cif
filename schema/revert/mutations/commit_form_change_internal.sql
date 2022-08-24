-- Revert cif:mutations/commit_form_change from pg

begin;

drop function cif_private.commit_form_change_internal(cif.form_change);

commit;
