-- Revert cif:form_change_is_pristine from pg

begin;

drop function cif.form_change_is_pristine(cif.form_change);

commit;
