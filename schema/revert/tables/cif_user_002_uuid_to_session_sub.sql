-- Revert cif:tables/cif_user_002_uuid_to_session_sub from pg

begin;

alter table cif.cif_user
    alter column session_sub type uuid using session_sub::uuid;
  alter table cif.cif_user
    rename column session_sub to uuid;

  drop index cif.cif_user_session_sub;
  create unique index cif_user_uuid on cif.cif_user(uuid);

  comment on column cif.cif_user.uuid is 'Universally Unique ID for the user, defined by the single sign-on provider';

commit;
