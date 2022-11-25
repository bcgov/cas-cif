-- Verify cif:tables/cif_user_004_allow_sub_update_flag on pg

begin;

select allow_sub_update from cif.cif_user limit 0;

rollback;
