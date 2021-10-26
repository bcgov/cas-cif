-- Revert cif:util_functions/verify_policy_not_present from pg

begin;

drop function cif_private.verify_policy_not_present(text, text);

commit;
