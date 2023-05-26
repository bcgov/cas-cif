begin;

do $$
  declare current_revision cif.project_revision;
      amendment cif.project_revision;
      general_revision cif.project_revision;
       project_id int;
    --   amendment_id int;
  begin

--    create a project with the minimum allowed form data filled out
      current_revision := cif.create_project(1);

      update cif.form_change
      set new_form_data= jsonb_build_object(
          'operatorId', 1,
          'fundingStreamRfpId', 1,
          'projectStatusId', 1,
          'proposalReference', 'Minimum project',
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'Minimum Project ',
          'totalFundingRequest', 100000,
          'sectorName', 'Agriculture',
          'projectType', 'Carbon Capture'
          )
      where project_revision_id=current_revision.id and form_data_table_name='project';

    perform cif.commit_project_revision(current_revision.id) from cif.project_revision;


    -- create an amendment with no changes
    -- brianna not a great system, find a better way to get project_id

--       amendment := cif.create_project_revision((select id from cif.project), 'Amendment');

--     --   update cif.project_revision
--     --     set revision_type = 'Amendment',
--     --     change_status = 'pending',
--     --     revision_status = 'Draft'
--     --     where id = amendment.id;

--       insert into cif.project_revision_amendment_type(
--         project_revision_id,
--         amendment_type
--       )
--       values
--       (amendment.id, 'Scope'),
--       (amendment.id, 'Schedule');

--       -- create a general revision with all form data filled out

--       general_revision := cif.create_project_revision((select id from cif.project), 'General Revision');


--     insert into cif.form_change(
--         new_form_data,
--         operation,
--         form_data_schema_name,
--         form_data_table_name,
--         change_status,
--         json_schema_name,
--         project_revision_id
--       )
--       values
--       (
--         json_build_object(
--           'cifUserId', 1,
--           'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
--           'projectManagerLabelId', 1
--           ),
--         'create', 'cif', 'project_manager', 'pending', 'project_manager', current_revision.id);

--       insert into cif.form_change(
--         new_form_data,
--         operation,
--         form_data_schema_name,
--         form_data_table_name,
--         change_status,
--         json_schema_name,
--         project_revision_id
--       )
--       values
--       (
--         json_build_object(
--           'contactId', 1,
--           'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=current_revision.id),
--           'contactIndex', 1
--           ),
--         'create', 'cif', 'project_contact', 'pending', 'project_contact', current_revision.id);



-- -- commit general revision
--       update cif.project_revision
--         set change_status = 'committed',
--         revision_status = 'Applied'
--         where id = general_revision.id;


  end
$$;
commit;
