-- Revert cif:functions/jsonb_minus from pg

begin;

drop function if exists cif.jsonb_minus(jsonb, jsonb);

commit;
