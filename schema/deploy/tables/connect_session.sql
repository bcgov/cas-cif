-- Deploy cif:tables/connect_session to pg
-- requires: schemas/private

begin;

create table cif_private.connect_session (
  sid varchar(4093) not null primary key,
  sess json not null,
  expire timestamp(6) not null
)
with (oids=false);

create index cif_private_idx_session_expire
  on cif_private.connect_session(expire);

grant all on cif_private.connect_session to public;

comment on table cif_private.connect_session is 'The backing store for connect-pg-simple to store express session data';
comment on column cif_private.connect_session.sid is 'The value of the symmetric key encrypted connect.sid cookie';
comment on column cif_private.connect_session.sess is 'The express session middleware object picked as json containing the jwt';
comment on column cif_private.connect_session.expire is 'The timestamp after which this session object will be garbage collected';

commit;
