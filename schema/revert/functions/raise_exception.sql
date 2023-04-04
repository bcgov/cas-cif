-- Revert cif:functions/raise_exception from pg

begin;

drop function cif_private.raise_exception(text);

commit;
