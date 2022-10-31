begin;

select plan(1);

select has_function(
  'cif',
  'project_revision_gross_payment_amount',
  ARRAY['cif.project_revision'],
  'Computed column to calculate the gross payment amount of a revision should exist');

-- TODO: Implement this as part of #986

select finish();

rollback;
