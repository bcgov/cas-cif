-- Deploy cif:mutations/create_single_field_project_revision to pg

begin;

create or replace function cif.create_single_field_project_revision(
  project_id integer,
  form_data_table_name varchar(1000),
  -- Partial of the form '{"field_name": "new value"}'
  -- Temporary solution, based on current understanding of how the frontend will be implemented. Liable to change to a full "new_form_data" object.
  partial_form_data jsonb
)
returns cif.project_revision
as $function$
declare
  revision_row cif.project_revision := cif.create_project_revision(project_id => $1, revision_type => 'General Revision');
  form_change_record record;
begin
  update cif.form_change fc
    set new_form_data = (fc.new_form_data || $3)
    where project_revision_id = revision_row.id
    and fc.form_data_table_name = $2;

  -- Set the change reason on the project revision
  update cif.project_revision
    set change_reason = (select format(
      'Changed %s to %s',
      (select quote_ident(cif_private.camel_to_snake_case(key)) from jsonb_each(partial_form_data) limit 1),
      (select quote_nullable(value) from jsonb_each_text(partial_form_data) limit 1)))
    where id = revision_row.id;

  perform cif.commit_project_revision(revision_row.id);

  update cif.form_change fc
    set new_form_data = (fc.new_form_data || $3)
    where form_data_record_id = $1
    and fc.form_data_table_name = $2
    and change_status = 'pending';

  return (select row(project_revision.*)::cif.project_revision from cif.project_revision where id = revision_row.id);
end;
$function$ language plpgsql strict;


commit;
