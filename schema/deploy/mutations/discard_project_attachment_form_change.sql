-- Deploy cif:mutations/discard_project_attachment_form_change to pg

begin;

drop function cif.discard_project_attachment_form_change;
create function cif.discard_project_attachment_form_change(form_change_id int)
returns cif.form_change
as $discard_project_attachment_form_change$
declare
form_change_record record;

begin

  select * from cif.form_change where id = $1 into form_change_record;

  if form_change_record.operation = 'create' then
    delete from cif.form_change where id = form_change_record.id;
  else
    update cif.form_change set operation = 'archive' where id = form_change_record.id;
  end if;
  return form_change_record;
end;

$discard_project_attachment_form_change$ language plpgsql volatile;

commit;
