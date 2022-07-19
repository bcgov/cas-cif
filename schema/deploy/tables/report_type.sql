-- Deploy cif:tables/report_type to pg


begin;

insert into cif.report_type (name, is_milestone, has_expenses)
values
  ('TEIMP', false, false);

commit;
