-- Deploy cif:tables/payment to pg

begin;

create table cif.payment
(
  id integer primary key generated always as identity,
  reporting_requirement_id integer references cif.reporting_requirement(id) not null,
  gross_amount numeric,
  net_amount numeric,
  date_sent_to_csnr timestamptz
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
comment on column cif.payment.reporting_requirement_id is 'Foreign key references the cif.reporting_requirement table';
comment on column cif.payment.gross_amount is 'The gross amount of the payment. This is the amount before deducting any holdback amount';
comment on column cif.payment.net_amount is 'The net amount of the payment. This is the amount actually paid out, after deducting any holdback amount';
comment on column cif.payment.date_sent_to_csnr is 'The date the payment was issued';

commit;
