-- Deploy cif:mutations/discard_milestone_form_change to pg
-- requires: tables/form_change
-- requires: tables/project_revision

begin;

drop function cif.discard_milestone_form_change;

commit;
