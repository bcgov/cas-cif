begin;

do $$
  declare current_revision cif.project_revision;
  begin
  -- ep projects
    for index in 1..50 loop
      current_revision := cif.create_project(1);

      update cif.form_change
      set new_form_data= jsonb_build_object(
          'operatorId', 1,
          'fundingStreamRfpId', 1,
          'projectStatusId', 1,
          'proposalReference', 'EP' || lpad(index::text, 3, '0'),
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'Test EP Project ' || lpad(index::text, 3, '0'),
          'totalFundingRequest', cast(rpad(index::text, 3, '0') as bigint),
          'sectorName', 'Agriculture',
          'projectType', 'Carbon Capture',
          'score', index
          )
      where project_revision_id=current_revision.id and form_data_table_name='project';

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
          'cifUserId', least(index, 6),
          'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
          'projectManagerLabelId', 1
          ),
        'create', 'cif', 'project_manager', 'pending', 'project_manager', current_revision.id);

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
          'contactId', index,
          'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
          'contactIndex', 1
          ),
        'create', 'cif', 'project_contact', 'pending', 'project_contact', current_revision.id);
    end loop;

  -- ia projects
    for index in 1..5 loop

      current_revision := cif.create_project(5);

      update cif.form_change
      set new_form_data= jsonb_build_object(
          'operatorId', 2,
          'fundingStreamRfpId', 5,
          'projectStatusId', 2,
          'proposalReference', 'IA' || lpad(index::text, 3, '0'),
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'Test IA Project ' || lpad(index::text, 3, '0'),
          'totalFundingRequest', cast(rpad(index::text, 5, '0') as bigint),
          'sectorName', 'Cement',
          'projectType', 'Fuel Switching'
          )
      where project_revision_id=current_revision.id and form_data_table_name='project';

      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        change_status,
        json_schema_name,
        project_revision_id)
      values
      (
        json_build_object(
          'cifUserId', least(index, 6),
          'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
          'projectManagerLabelId', 1
          ),
        'create', 'cif', 'project_manager', 'pending', 'project_manager', current_revision.id);

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
          'contactId', index,
          'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
          'contactIndex', 1
          ),
        'create', 'cif', 'project_contact', 'pending', 'project_contact', current_revision.id);





    end loop;

      -- external testing operator projects
 for index in 1..6 loop
      current_revision := cif.create_project(index);

      update cif.form_change
      set new_form_data= jsonb_build_object(
          'operatorId', 4,
          'fundingStreamRfpId', index,
          'projectStatusId', index,
          'proposalReference', 'EXTERNAL' || lpad(index::text, 3, '0'),
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'Test External Project ' || lpad(index::text, 3, '0'),
          'totalFundingRequest', cast(rpad(index::text, 3, '0') as bigint),
          'sectorName', 'Agriculture',
          'projectType', 'Carbon Capture',
          'score', index
          )
      where project_revision_id=current_revision.id and form_data_table_name='project';

    end loop;
  end
$$;
commit;
