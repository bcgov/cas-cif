-- Revert cif:mutations/commit_form_change from pg

begin;

drop function cif.commit_form_change(cif.form_change);

commit;
