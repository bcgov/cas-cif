-- Deploy cif:tables/report_type_004 to pg
-- requires: tables/report_type_003

begin;

insert into cif.report_type(name, is_milestone, has_expenses)
values
    ('Interim Summary Report', true, true);

commit;
