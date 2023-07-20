-- Deploy cif:mutations/discard_project_attachment_form_change to pg

begin;

drop function cif.discard_project_attachment_form_change;
create function cif.discard_project_attachment_form_change(form_change_id int)
returns cif.form_change
as $discard_project_attachment_form_change$
declare
form_change_record record;

begin

    if form_change_record.operation = 'create' then
      delete from cif.form_change where id = $1;
      return form_change_record;
    else
      update cif.form_change set operation = 'archive' where id = $1;
      return form_change_record;
    end if;

end;

$discard_project_attachment_form_change$ language plpgsql volatile;

commit;
