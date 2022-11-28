-- Deploy cif:mutations/discard_additional_funding_source_form_change to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

create or replace function cif.discard_additional_funding_source_form_change(form_change_id integer)
returns cif.project_revision
as $discard_additional_funding_source_form_change$
declare
form_change_record record;
return_value cif.project_revision;

begin
  select * from cif.project_revision where id = (select project_revision_id from cif.form_change where id = $1) into return_value;
  select * from cif.form_change where id = $1 into form_change_record;

  if form_change_record.operation = 'create' then
    delete from cif.form_change where id = form_change_record.id;
  else
    update cif.form_change set operation = 'archive' where id = form_change_record.id;
  end if;
  return return_value;
end;

$discard_additional_funding_source_form_change$ language plpgsql volatile;

grant execute on function cif.discard_additional_funding_source_form_change to cif_internal, cif_external, cif_admin;
comment on function cif.discard_additional_funding_source_form_change
is $$
  Custom mutation to discard a form change for an additional funding source.
$$;

commit;
