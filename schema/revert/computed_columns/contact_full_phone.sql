-- Revert cif:computed_columns/contact_full_phone from pg

begin;

drop function  cif.contact_full_phone(cif.contact);

commit;
