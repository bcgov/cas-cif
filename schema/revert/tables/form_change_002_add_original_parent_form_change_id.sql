-- Revert cif:tables/form_change_002_add_original_parent_form_change_id from pg

begin;

alter table cif.form_change drop column original_parent_form_change_id;
drop trigger _set_initial_ancestor_form_change_ids on cif.form_change;
create trigger _set_previous_form_change_id
    before insert on cif.form_change
    for each row
    execute procedure cif_private.set_previous_form_change_id();

commit;
