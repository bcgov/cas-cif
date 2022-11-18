-- Deploy cif:tables/form to pg
-- requires: schemas/main

begin;

-- No revert. Cannot change varchar back to regprocedure without error.
-- Table will be dropped in original revert file.

commit;
