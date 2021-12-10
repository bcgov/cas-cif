

begin;

select plan(1);

insert into cif.project_revision(change_status) values ('pending');
insert into cif.form_change(form_data_table_name) values ('cif.project'), ('some_other_table');



rollback;
