-- Verify cif:computed_columns/contact_pending_form_change on pg

begin;

select pg_get_functiondef('cif.contact_pending_form_change(cif.contact)'::regprocedure);

rollback;
