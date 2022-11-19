-- Deploy cif:tables/project_002_add_contract_number to pg

begin;

alter table cif.project add column contract_number varchar(100);

comment on column cif.project.contract_number is 'The contract number of the project';

commit;
