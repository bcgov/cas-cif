-- Revert cif:mutations/add_contact_to_revision from pg

begin;

drop function cif.add_contact_to_revision;

commit;
