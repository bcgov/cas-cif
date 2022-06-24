-- Revert cif:mutations/add_milestone_to_revision from pg

begin;

drop function cif.add_milestone_to_revision;

commit;
