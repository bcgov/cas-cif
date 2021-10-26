-- Revert cif:util_functions/upsert_timestamp_columns from pg

begin;

drop function cif_private.upsert_timestamp_columns(text,text,boolean,boolean,boolean,text,text);

commit;
