-- Deploy cif:mutations/add_additional_funding_source_to_revision to pg

begin;

drop function cif.add_additional_funding_source_to_revision(revision_id int, source_index int);


commit;
