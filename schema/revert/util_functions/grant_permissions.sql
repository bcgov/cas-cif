-- Revert cif:util_functions/grant_permissions from pg

begin;

drop function cif_private.grant_permissions(text, text, text, text);
drop function cif_private.grant_permissions(text, text, text, text[], text);

commit;
