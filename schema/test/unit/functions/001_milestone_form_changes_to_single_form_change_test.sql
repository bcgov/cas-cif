

begin;


select plan(99);


-- it takes the milestone data from existing revisions and puts them into the new json schema

-- it removes null values from the form data

-- it archives both form_changes for milestone_report and payment tables

-- it transforms the existing form_change for the reporting_requirement into the new format

-- it doesn't touch the form changes not in a revision

-- it is




select finish();

rollback;
