
begin;

select plan(3);

truncate cif.project_revision restart identity cascade;

insert into cif.project_revision(id, revision_type)
  overriding system value
  values (1, null), (2, 'Amendment'), (3, 'Minor Revision');

select cif.add_general_revision();

select has_function('cif', 'add_general_revision', 'function cif.add_general_revision exists');

select is((select count(*) from cif.project_revision where revision_type='General Revision'), 3::bigint, 'The add_general_revision function should add the General Revision type to all existing project revisions');

select is((select count(*) from cif.project_revision where revision_type!='General Revision'), 0::bigint, 'No project revisions should have a revision type other than General Revision');

select finish();

rollback;
