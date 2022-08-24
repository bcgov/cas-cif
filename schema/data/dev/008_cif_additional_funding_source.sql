begin;

do $$
  declare
    temp_row record;
    temp_id int;
  begin

for temp_row in select id, project_id from cif.project_revision loop
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        change_status,
        json_schema_name,
        project_revision_id
      )
      values
      (
        json_build_object(
            'projectId', (select form_data_record_id
                          from cif.form_change
                          where project_revision_id = temp_row.id
                          and form_data_table_name = 'project'
                        ),
            'sourceIndex', 1,
            'source', 'cheese import taxes',
            'amount', 1000,
            'status', 'Awaiting Approval'
          ),
        'create', 'cif', 'additional_funding_source', 'pending', 'additional_funding_source',temp_row.id) returning id into temp_id;

      perform cif_private.commit_form_change_internal((select row(form_change.*)::cif.form_change from cif.form_change where id = temp_id));
    end loop;
  end
$$;

commit;
