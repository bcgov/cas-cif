-- Deploy cif:mutations/discard_milestone_form_change to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

/**
  Removing or archiving a milestone is a chained operation. The data for milestones is spread across three tables:
    - reporting_requirement (base table, common to all reports)
    - milestone_report (data specific to milestone reports)
    - payment (payment data, common to some reports)
  Because this data is spread across three tables we have to remove or archive three form_change records within one transaction, one for each table.
**/

create or replace function cif.discard_milestone_form_change(revision_id int, reporting_requirement_index int)
returns setof cif.form_change
as $discard_milestone$
declare
form_change_record record;

begin

  for form_change_record in select * from cif.form_change
    where project_revision_id = $1
    and (
      (form_data_table_name = 'reporting_requirement' and (new_form_data->>'reportingRequirementIndex')::int = $2)
      or
      (form_data_table_name in ('milestone_report', 'payment')
      and (new_form_data->>'reportingRequirementId')::int = (
        select form_data_record_id
        from cif.form_change
        where form_data_table_name = 'reporting_requirement'
        and project_revision_id = $1
        and (new_form_data->>'reportingRequirementIndex')::int = $2
      ))
    )
  loop
    if form_change_record.operation = 'create' then
      delete from cif.form_change where id = form_change_record.id;
      return next form_change_record;
    else
      update cif.form_change set operation = 'archive' where id = form_change_record.id;
      return next form_change_record;
    end if;
  end loop;

end;

$discard_milestone$ language plpgsql volatile;

commit;
