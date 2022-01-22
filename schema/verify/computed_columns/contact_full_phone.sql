-- Verify cif:computed_columns/contact_full_phone on pg

begin;

select pg_get_functiondef('cif.contact_full_phone(cif.contact)'::regprocedure);

rollback;
