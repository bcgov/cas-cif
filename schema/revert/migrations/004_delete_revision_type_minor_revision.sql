-- Revert cif:migrations/004_delete_revision_type_minor_revision from pg

begin;

insert into cif.revision_type (type) values ('Minor Revision');

commit;
