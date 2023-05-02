begin;

select plan(4);


/** SETUP **/
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
insert into cif.operator (legal_name) values ('test operator');
do $$
  declare current_revision cif.project_revision;
  begin
    for index in 1..10 loop
      current_revision := cif.create_project(3);
      update cif.form_change
      set new_form_data= jsonb_build_object(
          'operatorId', 1,
          'fundingStreamRfpId', 3,
          'projectStatusId', 1,
          'proposalReference', lpad(index::text, 3, '0'),
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'Test Project ' || lpad(index::text, 3, '0'),
          'totalFundingRequest', cast(rpad(index::text, 3, '0') as bigint),
          'sectorName', 'Agriculture',
          'projectType', 'Carbon Capture',
          'score', index * 5
          )
      where project_revision_id=current_revision.id and form_data_table_name='project';
    end loop;
  end
$$;
update cif.form_change set new_form_data = new_form_data || '{"fundingStreamRfpId": 4, "score": 1234}' where id=6;
update cif.form_change set new_form_data = new_form_data || '{"fundingStreamRfpId": 5, "score": 5678}' where id=7;
update cif.form_change set new_form_data = new_form_data || '{"fundingStreamRfpId": 3, "score": 18}' where id=8;
update cif.form_change set new_form_data = new_form_data || '{"fundingStreamRfpId": 4}' where id=9;
update cif.form_change set new_form_data = new_form_data -'score' where id=9;


update cif.form_change set new_form_data = new_form_data || '{"fundingStreamRfpId": 5, "score": 5678}' where id=10;
do $$
  begin
    for index in 1..7 loop
      perform cif.commit_project_revision(index);
    end loop;
  end
$$;
/** END SETUP **/

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=9
    ) select * from cif.form_change_rank((select * from record))
  ),
  null,
  'Returns a null rank where a project has no score.'
);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=10
    ) select * from cif.form_change_rank((select * from record))
  ),
  1,
  'Returns the correct rank (only ranking against projects in the same year and funding stream) when a project has a tied score.'
);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=8
    ) select * from cif.form_change_rank((select * from record))
  ),
  3,
  'Returns the correct rank when scoring the first revision of a project (no project id in database)'
);



select cif.commit_project_revision(8);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=8
    ) select * from cif.form_change_rank((select * from record))
  ),
  3,
  'Returns the correct rank when scoring a subsequent revision of a project'
);

select finish();

rollback;
