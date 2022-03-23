-- Deploy cif:functions/form_change_parent_form_change_from_revision to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_parent_form_change_from_revision(form_change_id integer, project_revision_id integer)
returns setof integer as
$$

with recursive search_tree(id, previous_form_change_id) as (
    select f.id, f.previous_form_change_id, f.project_revision_id
    from cif.form_change f
    where f.id = $1
  union
    select f.id, f.previous_form_change_id, f.project_revision_id
    from cif.form_change f, search_tree s
    where s.previous_form_change_id = f.id
)
select id from search_tree where project_revision_id = $2;

$$ language 'sql' stable;

comment on function cif.form_change_parent_form_change_from_revision(integer, integer) is
  'returns an ancestor form_change from a specific revision for the form_change id passed in as a parameter';
commit;
