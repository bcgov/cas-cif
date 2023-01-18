-- Deploy cif:mutations/undo_form_changes to pg

begin;

create or replace function cif.undo_form_changes(form_changes_ids integer[])
returns cif.project_revision
as $$

declare
  form_change_id integer;
  fc cif.form_change;
  return_value cif.project_revision;

begin
  -- Since project revision is the same for all form changes, we can just use the first one
  select * from cif.project_revision where id = (select project_revision_id from cif.form_change where id = $1[1]) into return_value;

  foreach form_change_id in ARRAY $1 loop
    select * from cif.form_change where id = form_change_id into fc;
    if fc.previous_form_change_id is not null then
      update cif.form_change set operation = 'update', new_form_data = (select new_form_data from cif.form_change where id = fc.previous_form_change_id)
        where id = fc.id;
    else
    -- we need to treat project overview table differently as it needs a null object as form data
      if fc.form_data_table_name = 'project' then
        update cif.form_change set new_form_data = '{}'::jsonb where id = fc.id;
      else
        delete from cif.form_change where id = fc.id;
      end if;
    end if;
  end loop;
  return return_value;
end

$$ language plpgsql strict;

grant execute on function cif.undo_form_changes to cif_internal, cif_external, cif_admin;

commit;
