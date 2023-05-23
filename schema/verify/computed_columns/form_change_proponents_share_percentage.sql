-- Verify cif:computed_columns/form_change_proponents_share_percentage on pg

begin;

select pg_get_functiondef('cif.form_change_proponents_share_percentage(cif.form_change)'::regprocedure);

rollback;
