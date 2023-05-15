-- Revert cif:computed_columns/form_change_proponents_share_percentage from pg

begin;

drop function cif.form_change_proponents_share_percentage;

commit;
