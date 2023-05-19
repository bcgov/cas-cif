-- Revert cif:computed_columns/project_revision_teimp_payment_amount from pg

begin;

drop function cif.project_revision_teimp_payment_amount;

commit;
