-- Deploy cif:tables/cif_user_004_allow_sub_update_flag to pg
-- requires: tables/cif_user_003_create_policies

begin;


alter table cif.cif_user
  add column allow_sub_update boolean not null default false;

create trigger cif_user_session_sub_immutable_with_flag
    before update of session_sub on cif.cif_user
    for each row
    execute function cif_private.cif_user_session_sub_immutable_with_flag_set();

-- Allowing all the existing users to update the sub once.
update cif.cif_user set allow_sub_update = true;

comment on column cif.cif_user.allow_sub_update is 'Boolean value determines whether a legacy user can be updated. Legacy users may be updated only once.';

commit;
