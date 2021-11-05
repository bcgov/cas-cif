-- Revert cif:functions/session from pg


begin;

drop function cif.session();

commit;
