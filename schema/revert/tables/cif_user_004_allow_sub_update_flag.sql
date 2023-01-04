-- Revert cif:tables/cif_user_004_allow_sub_update_flag from pg

begin;

drop trigger cif_user_session_sub_immutable_with_flag on cif.cif_user;
alter table cif.cif_user drop column allow_sub_update;

commit;
