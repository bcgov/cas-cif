-- Deploy cif:functions/migration_set_original_parent_form_change_id to pg

begin;

create or replace function cif_private.migration_set_original_parent_form_change_id()
returns void as
$migration$
  with form_changes as (select * from cif.form_change)
  update cif.form_change fc set original_parent_form_change_id = form_changes.previous_form_change_id
    from form_changes where form_changes.id = fc.id;
$migration$ language sql volatile;

commit;
