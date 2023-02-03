begin;


do $$
  declare
  temp_row record;
  begin

  -- ep funding parameters
for temp_row in select id, project_id from cif.project_revision where id <51 loop
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
            'maxFundingAmount', 1,
            'anticipatedFundingAmount', 1,
            'proponentCost',777,
            'contractStartDate', now(),
            'projectAssetsLifeEndDate', now()
            ),
        'create', 'cif', 'funding_parameter', 'pending', 'funding_agreement', temp_row.id);
    end loop;



  -- ia funding parameters

for temp_row in select id, project_id from cif.project_revision where id > 50 loop
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
            'maxFundingAmount', 500,
            'anticipatedFundingAmount', 200,
            'proponentCost',3000,
            'contractStartDate', now(),
            'projectAssetsLifeEndDate', now()
            ),
        'create', 'cif', 'funding_parameter', 'pending', 'funding_agreement', temp_row.id);
    end loop;

  end
$$;

commit;
