-- Deploy cif:mutations/commit_form_change to pg
begin;

-- We need to explicitly drop the old function here since we're changing the signature.
drop function if exists cif_private.commit_form_change_internal(cif.form_change);
create or replace function cif_private.commit_form_change_internal(fc cif.form_change, pending_project_revision_id int default null)
    returns cif.form_change as $$
declare
  recordId int;
  pending_form_change cif.form_change;
  parent_of_pending_form_change cif.form_change;
  pending_minus_pendings_parent jsonb;
  committing_minus_pendings_parent jsonb;
  new_fc_in_pending_id int;
begin

  if fc.validation_errors != '[]' then
    raise exception 'Cannot commit change with validation errors: %', fc.validation_errors;
  end if;

  if fc.change_status = 'committed' then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  -- TODO : add a conditional behaviour based on fc.form_id
  execute format(
    'select "cif_private".%I($1)',
    (select form_change_commit_handler from cif.form where slug = fc.json_schema_name)
   ) using fc into recordId;

  update cif.form_change set
    form_data_record_id = recordId,
    change_status = 'committed'
  where id = fc.id;

  if pending_project_revision_id is not null then
    if fc.operation = 'create' then
    -- These are the forms that a project can have at most one of.
    -- If pending has created one alredy, then we need to set the previous_form_change_id and the form_data_record_id.
      if (
        (fc.json_schema_name in ('funding_parameter_EP', 'funding_parameter_IA', 'emission_intensity', 'project_summary_report')) and
        ((select count(id) from cif.form_change where project_revision_id = pending_project_revision_id and json_schema_name = fc.json_schema_name) > 0)
      ) then
        -- MIKE consider updating null fields in pending with values from committing.
        update cif.form_change set
          previous_form_change_id = fc.id,
          form_data_record_id = recordId
        where project_revision_id = pending_project_revision_id
          and json_schema_name = fc.json_schema_name;
      elsif (
        fc.json_schema_name = 'project_contact'
        and (select count(id) from cif.form_change where project_revision_id=pending_project_revision_id and json_schema_name=fc.json_schema_name) > 0
      ) then
      -- if pending has any contacts, then create the new form change in pending and update the contactIndex to be the highest
      -- contactIndex in pending + 1. If it doesn't then the catch-all for 'create' will handle it
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"contactIndex": %s}',
            (select max(new_form_data ->> contactIndex) from cif.form_change
              where project_revision_id=pending_project_revision_id
              and json_schema_name = fc.json_schema_name
            ) + 1)
          )
        );
        update cif.form_change set previous_form_change_id = fc.id where id = new_fc_in_pending_id;

      elsif (
        fc.json_schema_name = 'project_manager'
        and (
          (select count(id) from cif.form_change
          where project_revision_id=pending_project_revision_id
          and json_schema_name=fc.json_schema_name
          and new_form_data ->> 'projectManagerLabelId' = fc.new_form_data ->> 'projectManagerLabelId') > 0
        )
      ) then
      -- If the projectManagerLabelId already exists in pending, set the form_data_record_id and previous_form_change_id.
      -- If not, then the catch all case will handle it.
        update cif.form_change set
          previous_form_change_id = fc.id,
          form_data_record_id = recordId
        where id = (select id from cif.form_change
          where project_revision_id=pending_project_revision_id
          and json_schema_name=fc.json_schema_name
          and new_form_data ->> 'projectManagerLabelId' = fc.new_form_data ->> 'projectManagerLabelId');

      elsif (
        fc.json_schema_name = 'reporting_requirement'
        and (
          (select count(id) from cif.form_change where project_revision_id = pending_project_revision_id
            and json_schema_name = fc.json_schema_name
            and new_form_data ->> 'reportType' = fc.new_form_data ->> 'reportType')
        > 0)
      ) then
      -- If  reporting_requirements of this reportType already exist in pending, create the new form_change and set the reportingRequirementIndex
      -- to the highest existing in pending plus 1. If committing is the first reporting_requirement of this reportType, then the catch-all works.
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"reportingRequirementIndex": %s}',
            (select max(new_form_data ->> reportingRequirementIndex) from cif.form_change 
              where project_revision_id=pending_project_revision_id
              and json_schema_name = fc.json_schema_name
              and new_form_data ->> 'reportType' = fc.new_form_data ->> 'reportType'
            ) + 1)
          )
        );
        update cif.form_change set previous_form_change_id = fc.id where id = new_fc_in_pending_id;

      elsif (
        fc.json_schema_name = 'milestone'
        and (
          (select count(id) from cif.form_change where project_revision_id = pending_project_revision_id
            and json_schema_name = fc.json_schema_name)
        > 0)
      ) then
      -- If committing is creating a milestone and milestones exist, create the milestone in pending and set the reportingRequirementIndex
      -- to be the max existing in pending plus 1. If pending has no milestones, the catch-all works.
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"reportingRequirementIndex": %s}',
            (select max(new_form_data ->> reportingRequirementIndex) from cif.form_change 
              where project_revision_id=pending_project_revision_id
              and json_schema_name = fc.json_schema_name
            ) + 1)
          )
        );
        update cif.form_change set previous_form_change_id = fc.id where id = new_fc_in_pending_id;
      /**
      This next case acts as the catch-all for 'create'. It applies to any scenario in which the pending revision does not have an equivalent
      form change to the one being committed. This includes unordered lists (e.g. attachments, milestones, etc.), the unique forms
      like funding_parameter when pending has not created one yet, and ordered/pseudo ordered lists when the equivalent index does not
      exist in pending.
      **/
      else

        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => fc.new_form_data
        );
        update cif.form_change set previous_form_change_id = fc.id where id = new_fc_in_pending_id;
      end if;

    elsif fc.operation = 'update' then
      -- store the pending project revisions corresponding form_change, and its parent
      select * into pending_form_change from cif.form_change
        where project_revision_id = pending_project_revision_id
        and json_schema_name = fc.json_schema_name
        and form_data_record_id = fc.form_data_record_id limit 1;
      select * into parent_of_pending_form_change from cif.form_change
        where id = pending_form_change.previous_form_change_id limit 1;

      select (cif.jsonb_minus(pending_form_change.new_form_data, parent_of_pending_form_change.new_form_data))
        into pending_minus_pendings_parent;
      select (cif.jsonb_minus(fc.new_form_data, parent_of_pending_form_change.new_form_data))
        into committing_minus_pendings_parent;

      if committing_minus_pendings_parent is not null then
        if pending_minus_pendings_parent is not null then
          -- if the committing and pending form changes both have changes from the pending form change's parent,
          -- then set the pending form change to be the committing form change, plus the changes made in the penging form change.
          update cif.form_change
            set new_form_data =
              (fc.new_form_data || pending_minus_pendings_parent)
            where id = pending_form_change.id;
        else
          -- The pending form change hasn't made any changes since its creation, but the committing form change has.
          -- Set the pending form change ot be the committing form change as it is the latest information
          update cif.form_change
            set new_form_data =
              (fc.new_form_data)
            where id = pending_form_change.id;
        end if;
      end if;

    elsif fc.operation = 'archive' then
      delete from cif.form_change
      where project_revision_id = pending_project_revision_id
        and form_data_table_name = fc.form_data_table_name
        and form_data_record_id = fc.form_data_record_id;
    end if;
    -- Set the previous_form_change_id to be the committing form change.
    update cif.form_change set previous_form_change_id = fc.id where id = pending_form_change.id;
  end if;
  return (select row(form_change.*)::cif.form_change from cif.form_change where id = fc.id);
end;
  $$ language plpgsql volatile;

grant execute on function cif_private.commit_form_change_internal(cif.form_change, int) to cif_internal, cif_external, cif_admin;
comment on function cif_private.commit_form_change_internal(cif.form_change, int) is 'Commits the form change and calls the corresponding commit handler.';

commit;
