-- Deploy cif:computed_columns/project_revision_project_contact_form_changes to pg

begin;

create function cif.project_revision_project_contact_form_changes(cif.project_revision)
returns setof cif.form_change
as $function$

  with project_contact_form_change as (
    select * from cif.form_change
    where form_data_schema_name='cif'
      and form_data_table_name='project_contact'
      and operation != 'archive'
  ),
  current_revision_form_change as (
    select * from project_contact_form_change where project_revision_id = $1.id
  ),
  past_form_change as (
    select fc.*
      from project_contact_form_change fc
      join cif.project_revision pr
        on pr.id = fc.project_revision_id
        and pr.id != $1.id
        and pr.change_status = 'committed'
        and pr.project_id = $1.project_id
        and pr.updated_at < $1.updated_at
      join cif.project_contact pc -- exclude form changes for previously archived records
        on fc.form_data_record_id = pc.id
        and (
          pc.archived_at is null or
          pc.archived_at > $1.updated_at -- don't exclude records that are archived after this revision
        )
  ),
  form_change_history as (
    select * from current_revision_form_change
    union
    select * from past_form_change
  ),
  latest_form_change as (
    (select distinct on (form_data_record_id) *
      from form_change_history where form_data_record_id is not null
      order by form_data_record_id, updated_at desc, id desc)
    union
    (select * from form_change_history where form_data_record_id is null)
  )
  select * from latest_form_change order by new_form_data->'contactIndex';

$function$ language sql stable;

comment on function cif.project_revision_project_contact_form_changes(cif.project_revision) is
'Returns a set of form changes for the project contact form for the given project revision.
The forms returned are a snapshot of the project''s state at the time of the revision.';

commit;
