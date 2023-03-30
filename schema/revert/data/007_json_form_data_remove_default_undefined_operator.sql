-- Revert cif:data/007_json_form_data_remove_default_undefined_operator from pg

begin;

/* No revert required.
   This is an idempotent data insertion migration.
*/

commit;
