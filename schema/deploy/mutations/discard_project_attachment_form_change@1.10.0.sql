-- Deploy cif:mutations/discard_project_attachment_form_change to pg

begin;

create or replace function cif.discard_project_attachment_form_change(form_change_id int)
returns setof cif.form_change
as $discard_project_attachment_form_change$
declare
form_change_record record;

begin

  for form_change_record in select * from cif.form_change
    where id = $1
    and form_data_table_name = 'project_attachment'
  loop
    if form_change_record.operation = 'create' then
      delete from cif.form_change where id = $1;
      return next form_change_record;
    else
      update cif.form_change set operation = 'archive' where id = $1;
      return next form_change_record;
    end if;
  end loop;

end;

$discard_project_attachment_form_change$ language plpgsql volatile;

commit;
