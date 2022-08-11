-- Deploy cif:mutations/discard_funding_parameter_form_change to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

/**
  Removing or archiving a funding_parameter is a chained operation. The data for funding_parameter is spread across two tables:
    - reporting_requirement (base table, common to all reports)
    - funding_parameter (data specific to parameter_form)
  Because this data is spread across two tables we have to remove or archive two form_change records within one transaction, one for each table.
**/

create or replace function cif.discard_funding_parameter_form_change(revision_id int)
returns setof cif.form_change
as $discard_funding_parameter_form_change$
declare
form_change_record record;

begin

  for form_change_record in select * from cif.form_change
    where project_revision_id = $1
    and (
      (form_data_table_name = 'funding_parameter'))

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

$discard_funding_parameter_form_change$ language plpgsql volatile;

commit;
