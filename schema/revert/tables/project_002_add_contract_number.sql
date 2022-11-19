-- Revert cif:tables/project_002_add_contract_number from pg

begin;

alter table cif.project drop column if exists contract_number;

commit;
