-- Revert cif:mutations/add_additional_funding_source_to_revision from pg

begin;

drop function cif.add_additional_funding_source_to_revision;

commit;
