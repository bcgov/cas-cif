-- Revert cif:util_functions/verify_grant from pg

begin;

drop function cif_private.verify_grant(text, text, text, text);
drop function cif_private.verify_grant(text, text, text, text[], text);

commit;
