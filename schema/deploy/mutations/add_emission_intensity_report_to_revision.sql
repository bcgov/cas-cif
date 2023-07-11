-- Deploy cif:mutations/add_emission_intensity_report_to_revision to pg
-- requires: tables/reporting_requirement
-- requires: tables/form_change

begin;

drop function cif.add_emission_intensity_report_to_revision(revision_id int);

commit;
