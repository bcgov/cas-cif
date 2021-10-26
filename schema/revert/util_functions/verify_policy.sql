-- Revert cif:util_functions/verify_policy from pg

begin;

drop function cif_private.verify_policy(text, text, text, text, text);

commit;
