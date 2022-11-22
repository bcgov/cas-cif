-- Deploy cif:computed_columns/project_manager_names_concatenated to pg

-- instead returns text, concatenated, it'll be an empty string if there are no managers. Then it wouldn't need to take an argument, filter for empty string and not null (check filters for null or empty options). includes insensitive empty string (potentially consider refactoring to use tvector later)

begin;

create or replace function cif.project_manager_names_concatenated(cif.project)
returns text
as $$
declare
  index int;
  names text := '';
begin
  for index in 1..4
  loop
    select concat(names, (select cif.cif_user_full_name(
            (select row(cif_user.*)::cif.cif_user from cif.cif_user
            where cif.cif_user.id =
                (select cif_user_id from cif.project_manager
                where cif.project_manager.project_id=$1.id
                and cif.project_manager.project_manager_label_id=index))))::text);
  end loop;
  return names;
end;
$$ language plpgsql;

grant execute on function cif.cif_user_full_name to cif_internal, cif_admin;

comment on function cif.project_manager_names_concatenated is 'Returns a concatenated list of the project managers (used for filtering the projects table)';

commit;
