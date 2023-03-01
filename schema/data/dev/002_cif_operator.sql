begin;

insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  change_status,
  json_schema_name
)
values
('{
  "swrsOrganisationId": 1000,
  "legalName": "first operator legal name",
  "tradeName": "first operator trade name",
  "swrsLegalName": "first operator legal name",
  "swrsTradeName": "first operator trade name",
  "bcRegistryId": "AB1234567",
  "operatorCode": "ABCD" }', 'create', 'cif', 'operator', 'pending', 'operator'),
('{
  "swrsOrganisationId": 1001,
  "legalName": "second operator legal name",
  "tradeName": "second operator lorem ipsum dolor sit amet limited",
  "swrsLegalName": "second operator legal name",
  "swrsTradeName": "second operator lorem ipsum dolor sit amet limited",
  "bcRegistryId": "BC1234567",
  "operatorCode": "EFGH" }', 'create', 'cif', 'operator', 'pending', 'operator'),
('{
  "swrsOrganisationId": 1002,
  "legalName": "third operator legal name",
  "tradeName": "third operator trade name",
  "swrsLegalName": "third operator SWRS legal name",
  "swrsTradeName": "third operator SWRS trade name",
  "bcRegistryId": "EF3456789",
  "operatorCode": "IJKL" }', 'create', 'cif', 'operator', 'pending', 'operator'),
('{
  "swrsOrganisationId": 1003,
  "legalName": "external testing operator",
  "tradeName": "external testing operator",
  "swrsLegalName": "external testing operator SWRS legal name",
  "swrsTradeName": "external testing operator SWRS trade name",
  "bcRegistryId": "GH3456789",
  "operatorCode": "UDBJ" }', 'create', 'cif', 'operator', 'pending', 'operator')
  ;

do $$
  begin
  -- Commit records
    perform cif_private.commit_form_change_internal(row(form_change.*)::cif.form_change)
      from cif.form_change
      where form_data_table_name='operator';
  end
$$;

commit;
