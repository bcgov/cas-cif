-- Deploy cif:form_change_is_pristine to pg

begin;

create or replace function cif.form_change_is_pristine(fc cif.form_change) returns boolean as
$computed_column$

select fc.new_form_data = ( select new_form_data from cif.form_change pfc where fc.previous_form_change_id = pfc.id)
  and fc.operation != 'archive';

$computed_column$ language sql stable;


commit;
