-- Deploy cif:computed_columns/project_primary_managers to pg

begin;

create or replace function cif.project_primary_managers(cif.project)
returns text
as $$

with names as
  (select concat(
    cif.cif_user.given_name,
    (case
      when cif.cif_user.given_name is not null and cif.cif_user.family_name is not null
      then ' '
      else null
    end),
    cif.cif_user.family_name) as full from cif.cif_user


    where cif.cif_user.id in
        (select cif_user_id from cif.project_manager
        where cif.project_manager.project_id=$1.id
        and cif.project_manager.project_manager_label_id in (select id from cif.project_manager_label where label ilike '%primary%')
        )
  )
select string_agg(names.full,',') from names;

$$ language sql stable;

grant execute on function cif.project_primary_managers to cif_internal, cif_admin;

comment on function cif.project_primary_managers is 'Returns a concatenated list of the project managers (used for filtering the projects table)';

commit;
