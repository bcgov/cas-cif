-- Revert cif:tables/revision_status from pg

begin;

alter table cif.revision_status rename to amendment_status;
alter table cif.amendment_status drop column is_amendment_specific;

alter table cif.project_revision rename revision_status to amendment_status;

insert into cif.amendment_status (name)
values
  ('Approved');

commit;
