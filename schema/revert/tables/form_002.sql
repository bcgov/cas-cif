-- Revert cif:tables/form_002 from pg

begin;

-- No reverting json_schema_generator back to regprocedure. Cannot change varchar back to regprocedure without error.
-- Table will be dropped in original revert file.

commit;
