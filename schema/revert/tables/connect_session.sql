-- Revert cif:tables/connect_session on pg

begin;

drop table cif_private.connect_session;

commit;
