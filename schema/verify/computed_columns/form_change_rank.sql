-- Verify cif:computed_columns/form_change_rank on pg

begin;

select pg_get_functiondef('cif.form_change_rank(cif.form_change)'::regprocedure);

rollback;
