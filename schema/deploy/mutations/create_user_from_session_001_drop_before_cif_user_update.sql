-- Deploy cif:mutations/create_user_from_session_001_drop_before_cif_user_update to pg
-- requires: mutations/create_user_from_session

begin;

drop function cif.create_user_from_session;

commit;
