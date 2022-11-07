-- Verify cif:computed_columns/contact_pending_form_change_002_create_after_cif_user_update on pg

begin;

select pg_get_functiondef('cif.contact_pending_form_change(cif.contact)'::regprocedure);

rollback;
