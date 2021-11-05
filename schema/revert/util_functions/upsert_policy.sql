-- Revert cif:util_functions/upsert_policy from pg

begin;

drop function cif_private.upsert_policy(text, text, text, text, text, text);
drop function cif_private.upsert_policy(text, text, text, text, text, text, text);

commit;
