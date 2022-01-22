-- Revert cif:computed_columns/contact_full_name from pg

begin;

drop function cif.contact_full_name;

commit;
