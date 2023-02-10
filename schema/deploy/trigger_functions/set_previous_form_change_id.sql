-- Deploy cif:trigger_functions/set_previous_form_change_id to pg
-- requires: tables/form_change

begin;

  drop function if exists cif_private.set_previous_form_change_id;

commit;
