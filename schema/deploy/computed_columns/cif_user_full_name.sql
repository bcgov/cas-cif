-- Deploy cif:computed_columns/full_name to pg
-- requires: tables/cif_user

BEGIN;

create function cif.cif_user_full_name(u cif.cif_user)
returns varchar as $$
  select u.family_name || ', ' || u.given_name;
$$ language sql stable;

grant execute on function cif.cif_user_full_name to cif_internal, cif_admin;

comment on function cif.cif_user_full_name is 'Displays a cif_user as: family_name, given_name';

COMMIT;
