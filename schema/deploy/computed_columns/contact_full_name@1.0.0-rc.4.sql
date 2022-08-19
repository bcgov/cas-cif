-- Deploy cif:computed_columns/contact_full_name to pg

begin;
create or replace function cif.contact_full_name(contact cif.contact)
returns varchar(1000)
as
$computed_column$
  select concat(
    contact.family_name,
    (case
      when contact.family_name is not null and contact.given_name is not null
      then ', '
      else null
    end),
    contact.given_name);
$computed_column$ language sql immutable;

grant execute on function cif.contact_full_name to cif_internal, cif_admin;

comment on function cif.contact_full_name is 'Computed column for graphql to retrieve the full name of a contact';

commit;
