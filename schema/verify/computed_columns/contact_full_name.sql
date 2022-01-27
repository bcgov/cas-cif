-- Verify cif:computed_columns/contact_full_name on pg

begin;

select pg_get_functiondef('cif.contact_full_name(cif.contact)'::regprocedure);

rollback;
