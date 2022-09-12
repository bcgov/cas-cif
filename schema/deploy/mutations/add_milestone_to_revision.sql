-- Deploy cif:mutations/add_milestone_to_revision to pg
-- requires: tables/reporting_requirement
-- requires: tables/form_change

begin;

drop function cif.add_milestone_to_revision;

commit;
