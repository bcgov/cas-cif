-- Deploy cif:mutations/stage_dirty_form_changes to pg

begin;

create function cif.stage_dirty_form_changes(project_revision_id integer)
returns setof cif.form_change
as $function$
  update cif.form_change set change_status = 'staged'
  where project_revision_id = $1
  and change_status = 'pending'
  and (not cif.form_change_is_pristine(form_change) or cif.form_change_is_pristine(form_change) is null)
  returning *;
$function$
language sql strict volatile;

commit;
