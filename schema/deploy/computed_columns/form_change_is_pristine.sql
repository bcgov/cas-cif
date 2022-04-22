-- Deploy cif:form_change_is_pristine to pg

begin;

create or replace function cif.form_change_is_pristine(fc cif.form_change) returns boolean as
$computed_column$
begin
  return exists (
    select 1 from cif.form_change where cif.form_change.id = cif.form_change.previous_form_change_id
  );
end
$computed_column$ language plpgsql stable;


commit;
