-- Revert cif:computed_columns/project_revision_net_payment_amount from pg

begin;

drop function cif.project_revision_net_payment_amount;

commit;
