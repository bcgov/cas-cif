-- Deploy cif:computed_columns/project_revision_teimp_payment_amount to pg

begin;

drop function cif.project_revision_teimp_payment_amount(project_revision cif.project_revision);

commit;
