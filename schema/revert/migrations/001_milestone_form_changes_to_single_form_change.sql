-- Revert cif:migrations/001_milestone_form_change_to_single_form_change from pg

begin;

  -- nothing to revert, this is a one-way migration only.

commit;
