-- Revert cif:util_functions/read_only_user_policies from pg

begin;

drop function cif_private.read_only_user_policies(text, text);

commit;
