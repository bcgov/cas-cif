-- Deploy cif:tables/emission_intensity_payment_percentage to pg
-- requires: schemas/main

begin;

create table cif.emission_intensity_payment_percentage(
  id integer primary key generated always as identity,
  max_emission_intensity_performance numeric not null,
  payment_percentage numeric not null
);

select cif_private.upsert_timestamp_columns('cif', 'emission_intensity_payment_percentage');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'emission_intensity_payment_percentage', 'cif_internal');
perform cif_private.grant_permissions('insert', 'emission_intensity_payment_percentage', 'cif_internal');
perform cif_private.grant_permissions('update', 'emission_intensity_payment_percentage', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'emission_intensity_payment_percentage', 'cif_admin');
perform cif_private.grant_permissions('insert', 'emission_intensity_payment_percentage', 'cif_admin');
perform cif_private.grant_permissions('update', 'emission_intensity_payment_percentage', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.emission_intensity_payment_percentage is $$
  Table containing information about how CIF emission_intensity values map to a payment_percentage.
  This table is a lookup table that maps the emission intensity performance of a project to a payment percentage used to determine payments.
  The calculation for determininng emission intensity performance uses three metrics and a calculation.
  Metrics:
  - BEI: Baseline Emission Intensity
  - PEI: Post-Project Emission Intensity
  - TEI: Target Emission Intensity
  Calculation:
  - Emission Intensity Performance = (BEI - PEI) / (BEI - TEI) * 100
$$;
comment on column cif.emission_intensity_payment_percentage.id is 'Unique ID for the emission_intensity_payment_percentage';
comment on column cif.emission_intensity_payment_percentage.max_emission_intensity_performance is $$
  The calculated emission intensity performance.
  This is stored as a maxiumum as any value 30 and below maps to 0% and any value 100 and above (stored as Infinity) maps to 100%
$$;
comment on column cif.emission_intensity_payment_percentage.payment_percentage is 'The payment percentage linked to the value of max_emission_intensity_performance';

insert into cif.emission_intensity_payment_percentage(max_emission_intensity_performance, payment_percentage)
values
  (30, 0),
  (31, 2),
  (32, 3),
  (33, 5),
  (34, 6),
  (35, 8),
  (36, 9),
  (37, 11),
  (38, 12),
  (39, 14),
  (40, 15),
  (41, 17),
  (41, 17),
  (42, 18),
  (43, 20),
  (44, 21),
  (45, 23),
  (46, 24),
  (47, 26),
  (48, 27),
  (49, 29),
  (50, 30),
  (51, 32),
  (52, 33),
  (53, 35),
  (54, 36),
  (55, 38),
  (56, 39),
  (57, 41),
  (58, 42),
  (59, 44),
  (60, 45),
  (61, 47),
  (62, 48),
  (63, 50),
  (64, 51),
  (65, 53),
  (66, 54),
  (67, 56),
  (68, 57),
  (69, 59),
  (70, 60),
  (71, 62),
  (72, 63),
  (73, 65),
  (74, 66),
  (75, 68),
  (76, 69),
  (77, 71),
  (78, 72),
  (79, 74),
  (80, 75),
  (81, 77),
  (82, 78),
  (83, 80),
  (84, 81),
  (85, 83),
  (86, 84),
  (87, 86),
  (88, 87),
  (89, 89),
  (90, 90),
  (91, 92),
  (92, 93),
  (93, 95),
  (94, 96),
  (95, 98),
  (96, 99),
  (97, 100),
  (98, 100),
  (99, 100),
  ('Infinity'::numeric, 100);

commit;
