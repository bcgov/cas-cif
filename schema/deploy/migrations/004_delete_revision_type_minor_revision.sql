-- Deploy cif:migrations/004_delete_revision_type_minor_revision to pg

begin;

delete from cif.revision_type where type = 'Minor Revision';

commit;
