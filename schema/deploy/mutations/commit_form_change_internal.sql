-- Deploy cif:mutations/commit_form_change to pg
begin;
/*
To allow for pending project revisions to remain up to date with the project when other revisions are commit, a significant amount
of conditional logic has been introduced in the form of nested if statements. This should be refactored to a more maintainable &
readable structure.

*/
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
/*
  These are the forms that a project can have at most one of.
  If pending has created one alredy, then we need to set the previous_form_change_id and the form_data_record_id.
*/
      if (
        (fc.json_schema_name in ('funding_parameter_EP', 'funding_parameter_IA', 'emission_intensity', 'project_summary_report')) and
        ((select count(id) from cif.form_change where project_revision_id = pending_project_revision_id and json_schema_name = fc.json_schema_name) > 0)
      ) then
        update cif.form_change set
          previous_form_change_id = fc.id,
          form_data_record_id = recordId
        where project_revision_id = pending_project_revision_id
          and json_schema_name = fc.json_schema_name;


/*
  If the committing form_change is creating a project contact, and the contactIndex already exists in the pending revision, then we want
  the contactId in pending to remain at that contactIndex. To do this, we create a new form_change in the pending project revision with
  the contactId being commit, set its operation to create, and its contactIndex to one higher than the current highest index. We then
  update the pending form change to have an operation of update, and give it the same form_data_record_id as committing, and assign the
  committing id to be the previous_form_change_id.
*/

      elsif (
        fc.json_schema_name = 'project_contact'
        and (select count(*) from cif.form_change where
          project_revision_id = pending_project_revision_id and
          json_schema_name = 'project_contact' and
          new_form_data ->> 'contactIndex' = fc.new_form_data ->> 'contactIndex') > 0
      ) then
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'create'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id =>  null,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"contactIndex": %s}',
            ((select max((new_form_data ->> 'contactIndex')::int) from cif.form_change
              where project_revision_id = pending_project_revision_id
              and json_schema_name = 'project_contact'
            ) + 1))::jsonb
          )
        );
        update cif.form_change set
          operation = 'update'::cif.form_change_operation,
          form_data_record_id = recordId,
          previous_form_change_id = fc.id
        where project_revision_id = pending_project_revision_id
          and json_schema_name = 'project_contact'
          and new_form_data ->> 'contactIndex' = fc.new_form_data ->> 'contactIndex';

/*
  If the projectManagerLabelId already exists in pending, set the form_data_record_id and previous_form_change_id,
  and the operation to 'update' to handle when pending has an opertion of 'create'. If not, then the catch all case will handle it.
*/
      elsif (
        fc.json_schema_name = 'project_manager'
        and (
          (select count(*) from cif.form_change
          where project_revision_id = pending_project_revision_id
          and json_schema_name = fc.json_schema_name
          and new_form_data ->> 'projectManagerLabelId' = fc.new_form_data ->> 'projectManagerLabelId') > 0
        )
      ) then
        update cif.form_change set
          previous_form_change_id = fc.id,
          form_data_record_id = recordId,
          operation = 'update'::cif.form_change_operation
        where id = (select id from cif.form_change
          where project_revision_id = pending_project_revision_id
          and json_schema_name = fc.json_schema_name
          and new_form_data ->> 'projectManagerLabelId' = fc.new_form_data ->> 'projectManagerLabelId');

/*
  If  reporting_requirements of this reportType already exist in pending, create the new form_change and set the reportingRequirementIndex
  to the highest existing in pending plus 1. If committing is the first reporting_requirement of this reportType, then the catch-all works.
*/
      elsif (
        fc.json_schema_name = 'reporting_requirement'
        and (
          (select count(*) from cif.form_change where project_revision_id = pending_project_revision_id
            and json_schema_name = fc.json_schema_name
            and new_form_data ->> 'reportType' = fc.new_form_data ->> 'reportType')
          > 0)
      ) then
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"reportingRequirementIndex": %s}',
            (select max((new_form_data ->> 'reportingRequirementIndex')::int) from cif.form_change
              where project_revision_id=pending_project_revision_id
              and json_schema_name = fc.json_schema_name
              and new_form_data ->> 'reportType' = fc.new_form_data ->> 'reportType'
            ) + 1)::jsonb
          )
        );
        update cif.form_change set previous_form_change_id = fc.id where id = new_fc_in_pending_id;

/*
  If committing is creating a milestone and milestones exist, create the milestone in pending and set the
  reportingRequirementIndex to be the max existing in pending plus 1.
  If pending has no milestones, the catch-all works.
*/
      elsif (
        fc.json_schema_name = 'milestone'
        and (
          (select count(id) from cif.form_change where project_revision_id = pending_project_revision_id
            and json_schema_name = fc.json_schema_name)
        > 0)
      ) then
        select id into new_fc_in_pending_id from cif.create_form_change(
          operation => 'update'::cif.form_change_operation,
          form_data_schema_name => 'cif',
          form_data_table_name => fc.form_data_table_name,
          form_data_record_id => recordId,
          project_revision_id => pending_project_revision_id,
          json_schema_name => fc.json_schema_name,
          new_form_data => (fc.new_form_data || format('{"reportingRequirementIndex": %s}',
            (select max((new_form_data ->> 'reportingRequirementIndex')::int) from cif.form_change
              where project_revision_id=pending_project_revision_id
              and json_schema_name = fc.json_schema_name
            ) + 1)::jsonb
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
        where id = pending_form_change.previous_form_change_id;

      select (cif.jsonb_minus(pending_form_change.new_form_data, parent_of_pending_form_change.new_form_data))
        into pending_minus_pendings_parent;
      select (cif.jsonb_minus(fc.new_form_data, parent_of_pending_form_change.new_form_data))
        into committing_minus_pendings_parent;

/*
  If the committing and pending form changes both have changes from the pending form change's parent,
  then set the pending form change's new_form_data to be the committing form change's, and apply the changes
  made in the pending form change to that data.
*/
      if committing_minus_pendings_parent is not null then
        if pending_minus_pendings_parent is not null then
          update cif.form_change
            set new_form_data =
              (fc.new_form_data || pending_minus_pendings_parent)
            where id = pending_form_change.id;

  /*
    If the pending form change hasn't made any changes since its creation, but the committing form change has,
    set the pending form change's new_form_data to be the committing form_change's, as it is the latest information.
  */
        else
          update cif.form_change
            set new_form_data = (fc.new_form_data)
            where id = pending_form_change.id;
        end if;
      end if;
      -- Set the previous_form_change_id to be the committing form change.
      update cif.form_change set previous_form_change_id = fc.id where id = pending_form_change.id;

    elsif fc.operation = 'archive' then
      select * into pending_form_change from cif.form_change
        where project_revision_id = pending_project_revision_id
        and json_schema_name = fc.json_schema_name
        and form_data_record_id = fc.form_data_record_id;
      select * into parent_of_pending_form_change from cif.form_change
        where id = pending_form_change.previous_form_change_id;

      select (cif.jsonb_minus(pending_form_change.new_form_data, parent_of_pending_form_change.new_form_data))
        into pending_minus_pendings_parent;

/*
  If pending has made changes, then set its operation to create and null the form data record id & previous form change id
  since it's technically creating them now. This way the archiving still took place in the committing form change, and we
  avoid trying to update the now archived record that form_data_record_id points to.
*/
      if pending_minus_pendings_parent is not null then
        update cif.form_change set
          operation = 'create'::cif.form_change_operation,
          form_data_record_id = null,
          previous_form_change_id = null
        where id = pending_form_change.id;

      else
/*
  If pending has not made changes to the form data, the pending record can be deleted as it never would have been made
*/
        delete from cif.form_change
        where project_revision_id = pending_project_revision_id
          and form_data_table_name = fc.form_data_table_name
          and form_data_record_id = fc.form_data_record_id;
      end if;
    end if;
  end if;
  return (select row(form_change.*)::cif.form_change from cif.form_change where id = fc.id);
end;
  $$ language plpgsql volatile;

grant execute on function cif_private.commit_form_change_internal(cif.form_change, int) to cif_internal, cif_external, cif_admin;
comment on function cif_private.commit_form_change_internal(cif.form_change, int) is
  'Commits the form change and calls the corresponding commit handler. Then, update a potential existing revision to include the changes that were just committed.';

commit;
