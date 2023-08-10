begin;


do $$
  declare
  temp_row record;
  end_of_day_today timestamptz;
  begin

  end_of_day_today:= (select date 'tomorrow' + time 'allballs' - interval '1 second')::timestamptz;
-- ep funding parameters
for temp_row in select id, project_id from cif.project_revision
    where cif.project_revision.id = ((
      select project_revision_id from cif.form_change
      where project_revision_id = cif.project_revision.id
     and (new_form_data->>'fundingStreamRfpId')::integer

      in ((
            select id from cif.funding_stream_rfp
            where funding_stream_id=((
              select id from cif.funding_stream
                where name='EP'))
            ))
    ))
  loop
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
            'contractStartDate', end_of_day_today,
            'projectAssetsLifeEndDate', end_of_day_today,
            'additionalFundingSources', json_build_array(
              json_build_object(
                'source', 'cheese import taxes',
                'amount', 1000,
                'status', 'Awaiting Approval'
                )
             )
            ),
        'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_EP', temp_row.id);
    end loop;



-- ia funding parameters
for temp_row in select id, project_id from cif.project_revision
    where cif.project_revision.id = ((
      select project_revision_id from cif.form_change
      where project_revision_id = cif.project_revision.id
      and (new_form_data->>'fundingStreamRfpId')::integer
      in ((
        select id from cif.funding_stream_rfp
        where funding_stream_id=((
          select id from cif.funding_stream
            where name='IA'))
        ))
    ))
  loop
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
            'contractStartDate', (select date 'tomorrow' + time 'allballs' - interval '1 second')::timestamptz,
            'projectAssetsLifeEndDate', end_of_day_today,
            'additionalFundingSources', json_build_array(
              json_build_object(
                'source', 'pretzel import taxes',
                'amount', 500,
                'status', 'Approved'
                )
             )
            ),
        'create', 'cif', 'funding_parameter', 'pending', 'funding_parameter_IA', temp_row.id);
    end loop;

  end
$$;

commit;
