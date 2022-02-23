-- Revert cif:types/manager_form_changes_by_label_composite_return from pg

begin;

drop type cif.manager_form_changes_by_label_composite_return;

commit;
