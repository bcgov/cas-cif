-- Deploy cif:tables/report_type_003 to pg
-- requires: tables/report_type_002

begin;

insert into cif.report_type(name, is_milestone, has_expenses)
values
    ('Project Summary Report', false, true);

commit;
