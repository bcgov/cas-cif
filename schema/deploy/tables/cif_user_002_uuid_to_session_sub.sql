-- Deploy cif:tables/cif_user_002_uuid_to_session_sub to pg
-- requires: tables/cif_user_001_drop_policies
-- requires: tables/cif_user

begin;

alter table cif.cif_user
  alter column uuid type varchar(1000);
alter table cif.cif_user
  rename column uuid to session_sub;

create unique index cif_user_session_sub on cif.cif_user(session_sub);
drop index cif.cif_user_uuid;

comment on column cif.cif_user.session_sub is 'Universally Unique ID for the user, defined by the single sign-on provider';

commit;
