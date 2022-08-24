-- Deploy cif:mutations/update_form_change to pg

begin;

create or replace function cif.update_form_change(row_id int, input cif.form_change)
returns cif.form_change
as
$$

  update cif.form_change set change_status = 'pending' where id=input.id;

  select * from cif.form_change where id=input.id;

$$ language sql volatile;

comment on function cif.update_form_change(row_id int, input cif.form_change) is E'@arg1variant patch';

commit;
