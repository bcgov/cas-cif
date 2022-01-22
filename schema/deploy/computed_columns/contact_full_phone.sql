-- Deploy cif:computed_columns/contact_full_phone to pg

begin;

create or replace function cif.contact_full_phone(contact cif.contact)
returns varchar(1000)
as
$computed_column$
  select concat(
    regexp_replace(contact.phone, '^(\+\d)(\d{3})(\d{3})(\d{4})$', '\1 (\2) \3-\4'),
    (case
      when contact.phone_ext is not null
      then ' ext. '
      else null
    end),
    contact.phone_ext
    );
$computed_column$ language sql immutable;

grant execute on function cif.contact_full_phone to cif_internal, cif_admin;

comment on function cif.contact_full_name is 'Computed column for graphql to retrieve the full formatted phone of a contact';

commit;
