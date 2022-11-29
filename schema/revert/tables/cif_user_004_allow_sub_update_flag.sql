-- Revert cif:tables/cif_user_004_allow_sub_update_flag from pg

begin;

alter table cif.cif_user drop column allow_sub_update;

commit;
