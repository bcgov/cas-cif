

begin;

select plan(5);

-- Test setup --
insert into cif.operator(legal_name) values ('test operator');
insert into cif.funding_stream(name, description) values ('test funding stream', 'desc');
truncate cif.project restart identity cascade;
select cif.create_project(1);
select cif.create_project(1);
select cif.create_project(1);

-- disable blocking triggers
alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

-- set different statuses for testing
update cif.project_revision set change_status='staged' where id=2;
update cif.project_revision set change_status='committed' where id=3;

-- set database to pre-migration state
alter table cif.project_revision alter column revision_status drop not null;
update cif.project_revision set revision_status = null;
alter table cif.project_revision rename revision_status to amendment_status;

-- perform migration
alter table cif.project_revision rename amendment_status to revision_status;
alter table cif.project_revision alter column revision_status set default 'Draft';
update cif.project_revision
set revision_status =
(case
      when (revision_status='Approved')
        then 'Applied'
      when
        (change_status='pending') or
        (change_status='staged')
        then 'Draft'
    else 'Applied'
    end);
alter table cif.project_revision alter column revision_status set not null;

-- END SETUP

select hasnt_column(
  'cif',
  'project_revision',
  'amendment_status',
  'project_revision table no longer has an amendment_status column'
);

select has_column(
  'cif',
  'project_revision',
  'revision_status',
  'project_revision table now has a revision_status column'
);

select is (
  (
    select revision_status from cif.project_revision where id = 1
  ),
  'Draft',
  'A revision in pending change_status is correctly set to a revision_status of Draft'
);

select is (
  (
    select revision_status from cif.project_revision where id = 2
  ),
  'Draft',
  'A revision in staged change_status is correctly set to a revision_status of Draft'
);

select is (
  (
    select revision_status from cif.project_revision where id = 3
  ),
  'Applied',
  'A revision in committed change_status is correctly set to a revision_status of Applied'
);

select finish();

rollback;
