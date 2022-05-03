-- Deploy cif:tables/payment to pg

begin;

create table cif.payment
(
  id integer primary key generated always as identity,
  amount numeric not null,
  date_issued timestamptz,
  date_paid timestamptz,
  comment varchar(10000),
  transaction_id varchar(1000),
  status varchar(1000),
  reporting_requirement_id integer references cif.reporting_requirement(id) not null
);

select cif_private.upsert_timestamp_columns('cif', 'payment');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'payment', 'cif_internal');
perform cif_private.grant_permissions('insert', 'payment', 'cif_internal');
perform cif_private.grant_permissions('update', 'payment', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'payment', 'cif_admin');
perform cif_private.grant_permissions('insert', 'payment', 'cif_admin');
perform cif_private.grant_permissions('update', 'payment', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.payment is 'Table containing information about reporting requirements payments';
comment on column cif.payment.id is 'Unique ID for the payment';
comment on column cif.payment.amount is 'The amount of the payment';
comment on column cif.payment.date_issued is 'The date the payment was issued';
comment on column cif.payment.date_paid is 'The date the payment was paid';
comment on column cif.payment.comment is 'Comments about the payment';
comment on column cif.payment.transaction_id is 'The transaction ID of the payment';
comment on column cif.payment.status is 'The status of the payment';
comment on column cif.payment.reporting_requirement_id is 'Foreign key references the cif.reporting_requirement table';

commit;
