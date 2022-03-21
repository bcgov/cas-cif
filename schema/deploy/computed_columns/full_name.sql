-- Deploy cif:computed_columns/full_name to pg

BEGIN;

create or replace function cif.full_name(col anyelement)
returns varchar(1000)
as
$computed_column$
  select concat(
    col.family_name,
    (case
      when col.family_name is not null and col.given_name is not null
      then ', '
      else null
    end),
    col.given_name);
$computed_column$ language sql immutable;

grant execute on function cif.full_name to cif_internal, cif_admin;

comment on function cif.full_name is 'Displays a users (contact, cif_user) as: family_name, given_name';

COMMIT;
