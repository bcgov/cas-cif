-- Deploy cif:computed_columns/project_primary_manager_name_includes to pg

begin;

create or replace function cif.project_primary_manager_name_includes(cif.project, text)
returns boolean
as
$computed_column$

  select case when $2 is null
    then true
    when
--  if there's an id then there's a match so true
        (select id from cif.project_manager
        -- where it's the current project
        where cif.project_manager.project_id=$1.id
        and
        -- the name matches $2 how to get cif_user_full_name?
        (select cif.cif_user_full_name(
            (select row(cif_user.*)::cif.cif_user from cif.cif_user
            where cif.cif_user.id =
                (select cif_user_id from cif.project_manager
                where cif.project_manager.project_id=$1.id)
            )
        )
         ilike '%' || $2 || '%'))
        is not null
    then true
    else false
    end;
$computed_column$ language sql immutable;

grant execute on function cif.cif_user_full_name to cif_internal, cif_admin;

comment on function cif.project_primary_manager_name_includes is 'Returns true when the search string matches a primary project manager or when the search string is empty (used in filtering the projects list)';

commit;
