-- Verify cif:computed_columns/contact_full_name on pg

begin;

select pg_get_functiondef('cif.cif_user_full_name(cif.cif_user)'::regprocedure);

rollback;
