-- Deploy cif:functions/pending_new_form_change_for_table_001_drop_before_cif_user_update to pg
-- requires: functions/pending_new_form_change_for_table

begin;

drop function cif.pending_new_form_change_for_table;

commit;
