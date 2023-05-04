-- Deploy cif:computed_columns/form_change_rank to pg

begin;

create or replace function cif.form_change_rank(fc cif.form_change)
returns integer
as
$computed_column$

 with other_projects_score as (
    select project.id, score from cif.project
    join cif.funding_stream_rfp
      on project.funding_stream_rfp_id=funding_stream_rfp.id
    and funding_stream_rfp.year=(
      select year from cif.funding_stream_rfp
      where id=(
        select (new_form_data ->>'fundingStreamRfpId')::int from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=$1.project_revision_id
      )
    )
    join cif.funding_stream
      on funding_stream_rfp.funding_stream_id=funding_stream.id
    and funding_stream_rfp.id=
      (
        select(new_form_data ->>'fundingStreamRfpId')::int from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=$1.project_revision_id
      )
    -- As soon as there's a committed record for this project we want to exclude that record's score from the ranking calculation because it isn't as up-to-date as the new_form_data
    and project.id!=(select form_data_record_id from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=$1.project_revision_id
      )
  ),
  this_project_score as (
    select form_data_record_id as id, (new_form_data ->>'score')::numeric as score from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=$1.project_revision_id
  ),
  all_projects_score as (
    select * from other_projects_score
    union
    select * from this_project_score
  ),
  project_ranks as (
  select *, rank() over (order by score desc) rank_number
    from all_projects_score
    where score is not null
  )
  select rank_number::int from project_ranks
  where id = (select form_data_record_id from cif.form_change
        where form_data_table_name='project'
        and project_revision_id=$1.project_revision_id);

$computed_column$ language sql stable;

grant execute on function cif.form_change_rank to cif_internal, cif_external, cif_admin;

comment on function cif.form_change_rank is 'Computed column to determine the rank of a project';

commit;
