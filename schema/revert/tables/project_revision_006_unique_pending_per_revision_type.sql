-- Revert cif:tables/project_revision_006_unique_pending_per_revision_type from pg

begin;

drop index cif.project_revision_unique_pending_general_revision_per_project_id;
drop index cif.project_revision_unique_pending_amendment_per_project_id;
create unique index project_revision_unique_pending_per_project_id on cif.project_revision (project_id, change_status)
  where change_status = 'pending';

commit;
