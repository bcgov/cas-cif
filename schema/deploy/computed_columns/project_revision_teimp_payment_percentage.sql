-- Deploy cif:computed_columns/project_revision_teimp_payment_percentage to pg

begin;

drop function cif.project_revision_teimp_payment_percentage(cif.project_revision);

commit;
