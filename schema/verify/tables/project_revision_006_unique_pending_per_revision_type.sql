-- Verify cif:tables/project_revision_006_unique_pending_per_revision_type on pg

begin;

do $$
  begin
    assert (
      (select count(*) from pg_indexes where indexname='project_revision_unique_pending_general_revision_per_project_id')
    ), 'project_revision_unique_pending_general_revision_per_project_id was not created on cif.project_revision';
     assert (
      (select count(*) from pg_indexes where indexname='project_revision_unique_pending_amendment_per_project_id')
    ), 'project_revision_unique_pending_amendment_per_project_id was not created on cif.project_revision';
  end;
$$;


rollback;
