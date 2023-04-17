begin;

do $$
  declare
  temp_project_id int;
  temp_project_revision_id int;

  begin
    for temp_project_id in select id from cif.project
    loop
      -- first Amendment type project revision
      select id from cif.create_project_revision(temp_project_id) into temp_project_revision_id;
      update cif.project_revision
        set revision_type = 'Amendment',
        change_status = 'committed',
        revision_status = 'Applied'
        where id = temp_project_revision_id;

      insert into cif.project_revision_amendment_type(
        project_revision_id,
        amendment_type
      )
      values
      (temp_project_revision_id, 'Scope'),
      (temp_project_revision_id, 'Schedule');

      -- first General Revision type project revision
      select id from cif.create_project_revision(temp_project_id) into temp_project_revision_id;
      update cif.project_revision
        set revision_type = 'General Revision',
        change_status = 'committed',
        revision_status = 'Applied'
        where id = temp_project_revision_id;

      -- first Minor Revision type project revision
      select id from cif.create_project_revision(temp_project_id) into temp_project_revision_id;
      update cif.project_revision
        set revision_type = 'Minor Revision',
        change_status = 'committed',
        revision_status = 'Applied'
        where id = temp_project_revision_id;

      -- second Amendment type project revision
      select id from cif.create_project_revision(temp_project_id) into temp_project_revision_id;
      update cif.project_revision
        set revision_type = 'Amendment',
        change_status = 'pending',
        revision_status = 'In Discussion'
        where id = temp_project_revision_id;

      insert into cif.project_revision_amendment_type(
        project_revision_id,
        amendment_type
      )
      values
      (temp_project_revision_id, 'Schedule');
    end loop;
  end
$$;
commit;
