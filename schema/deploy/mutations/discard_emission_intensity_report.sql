-- Deploy cif:mutations/discard_emission_intensity_report to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

/**
  Removing or archiving a emission intensity report is a chained operation. The data for emissions intensity is spread across two tables:
    - reporting_requirement (base table, common to all reports)
    - discard_emission_intensity_report (data specific to milestone reports)
  Because this data is spread across two tables we have to remove or archive two form_change records within one transaction, one for each table.
**/

create or replace function cif.discard_emission_intensity_report(revision_id int)
returns setof cif.form_change
as $discard_emission_intensity_report$
declare
form_change_record record;

begin

  for form_change_record in select * from cif.form_change
    where project_revision_id = $1
    and (
      (form_data_table_name = 'reporting_requirement' and new_form_data->>'reportType' = 'TEIMP')
      or
      form_data_table_name = 'emission_intensity_report'
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

$discard_emission_intensity_report$ language plpgsql volatile;
grant execute on function cif.discard_emission_intensity_report to cif_internal, cif_external, cif_admin;

commit;
