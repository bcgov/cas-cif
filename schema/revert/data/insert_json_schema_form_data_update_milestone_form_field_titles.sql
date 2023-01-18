-- Revert cif:data/insert_json_schema_form_data_update_milestone_form_field_titles from pg

begin;

/* No revert required.
   This is an idempotent data insertion migration.
   Deleting this data before the cif.form table revert (where we drop the table itself)
   will likely cause foreign key reference errors.
*/

commit;
