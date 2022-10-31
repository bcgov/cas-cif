begin;

select plan(1);

select has_function(
  'cif',
  'project_revision_net_payment_amount',
  ARRAY['cif.project_revision'],
  'Computed column to calculate the net payment amount of a revision should exist');

-- TODO: Implement this as part of #986

select finish();

rollback;
