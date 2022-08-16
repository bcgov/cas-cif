-- Deploy cif:computed_columns/full_name to pg
-- requires: tables/cif_user

BEGIN;

create or replace function cif.cif_user_full_name(u cif.cif_user)
returns varchar(1000)
as
$computed_column$
  select concat(
    u.given_name,
    (case
      when u.given_name is not null and u.family_name is not null
      then ' '
      else null
    end),
    u.family_name);
$computed_column$ language sql immutable;

grant execute on function cif.cif_user_full_name to cif_internal, cif_admin;

comment on function cif.cif_user_full_name is 'Displays a cif_user as: given_name family_name';

COMMIT;
