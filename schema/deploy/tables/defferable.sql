-- Deploy cif:tables/defferable to pg

BEGIN;

alter table cif.form_change alter constraint project_proposal_reference_key deferrable;
alter table cif.project_revision constraint project_revision_project_id_fkey deferrable;

COMMIT;
