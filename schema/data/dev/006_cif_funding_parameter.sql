begin;


do $$
  declare
  temp_row record;
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
            'provinceSharePercentage', 50,
            'holdbackPercentage', 10,
            'totalProjectValue', 1,
            'maxFundingAmount', 1,
            'anticipatedFundingAmount', 1,
            'proponentCost',777
                ),
        'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter',temp_row.id);
    end loop;

  end
$$;

commit;
