begin;

do $$
  declare current_revision cif.project_revision;
      amendment cif.project_revision;
      general_revision cif.project_revision;
       project_id int;
       coffee text;
    --   amendment_id int;
  begin

--    create a project with the minimum allowed form data filled out
      current_revision := cif.create_project(1);
      -- temp id only, no readl project_id

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
    raise notice 'currentrevid %',current_revision.id;

   

  end
$$;
commit;
