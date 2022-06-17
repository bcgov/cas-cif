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

          'reportDueDate', now(),
          'completionDate', now(),
          'submittedDate', now(),
          'certifiedBy','Titus Andromedon',
          'certifiedBy_professional_designation', 'Professional Engineer',
          'projectId', (select form_data_record_id
                          from cif.form_change
                          where project_revision_id = temp_row.id
                          and form_data_table_name = 'project'
                        ),
          'reportType', 'General Milestone',
          'reportingRequirement_index',1,
          'maximumAmount', cast(rpad(temp_row.id::text, 3, '0') as bigint),
          'description', 'general milestone report description ' || temp_row.id
          ),
        'create', 'cif', 'reporting_requirement', 'pending', 'reporting_requirement',temp_row.id);
    end loop;

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

          'reportDueDate', now(),
          'submittedDate', now(),
          'comments','annual report comments ' || temp_row.id,
          'projectId', (select form_data_record_id
                          from cif.form_change
                          where project_revision_id = temp_row.id
                          and form_data_table_name = 'project'
                        ),
          'reportType', 'Annual',
          'reportingRequirementIndex',1
          ),
        'create', 'cif', 'reporting_requirement', 'pending', 'reporting_requirement',temp_row.id);
    end loop;

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

          'reportDueDate', now(),
          'submittedDate', now(),
          'comments','quarterly report comments ' || temp_row.id,
          'projectId', (select form_data_record_id
                          from cif.form_change
                          where project_revision_id = temp_row.id
                          and form_data_table_name = 'project'
                        ),
          'reportType', 'Quarterly',
          'reportingRequirementIndex',1
          ),
        'create', 'cif', 'reporting_requirement', 'pending', 'reporting_requirement',temp_row.id);
    end loop;

  end
$$;

commit;
