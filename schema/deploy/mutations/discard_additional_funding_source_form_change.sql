-- Deploy cif:mutations/discard_additional_funding_source_form_change to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

create or replace function cif.discard_additional_funding_source_form_change(revision_id int, source_index int)
returns setof cif.form_change
as $discard_additional_funding_source_form_change$
declare
form_change_record record;

begin
  for form_change_record in select * from cif.form_change
    where project_revision_id = $1
    and form_data_table_name = 'additional_funding_source' and (new_form_data->>'sourceIndex')::int = $2
  loop
    if form_change_record.operation = 'create' then
      delete from cif.form_change where id = form_change_record.id;
      return next form_change_record;
    else
      update cif.form_change set operation = 'archive' where id = form_change_record.id;
      return next form_change_record;
    end if;
  end loop;
end;

$discard_additional_funding_source_form_change$ language plpgsql volatile;

grant execute on function cif.discard_additional_funding_source_form_change to cif_internal, cif_external, cif_admin;
comment on function cif.discard_additional_funding_source_form_change
is $$
  Custom mutation to discard a form change for an additional funding source.
$$;

commit;
