-- Deploy cif:form_change_is_prestine to pg

BEGIN;

create or replace function cif.form_change_is_prestine(fc cif.form_change) returns boolean as
$computed_column$
BEGIN
  RETURN EXISTS (
    select 1 from cif.form_change where cif.form_change.id = cif.form_change.previous_form_change_id
  );
END
$computed_column$ language plpgsql stable;


commit;
