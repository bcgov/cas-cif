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
  "operatorCode": "ABCD" }', 'create', 'cif', 'operator', 'committed', 'operator'),
('{
  "swrsOrganisationId": 1001,
  "legalName": "second operator legal name",
  "tradeName": "second operator lorem ipsum dolor sit amet limited",
  "swrsLegalName": "second operator legal name",
  "swrsTradeName": "second operator lorem ipsum dolor sit amet limited",
  "bcRegistryId": "BC1234567",
  "operatorCode": "EFGH" }', 'create', 'cif', 'operator', 'committed', 'operator'),
('{
  "swrsOrganisationId": 1002,
  "legalName": "third operator legal name",
  "tradeName": "third operator trade name",
  "swrsLegalName": "third operator SWRS legal name",
  "swrsTradeName": "third operator SWRS trade name",
  "bcRegistryId": "EF3456789",
  "operatorCode": "IJKL" }', 'create', 'cif', 'operator', 'committed', 'operator');


commit;
