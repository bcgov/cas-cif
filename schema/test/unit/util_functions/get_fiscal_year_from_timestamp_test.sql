begin;
select plan(12);

select is((select cif.get_fiscal_year_from_timestamp('2021-01-01 16:21:42.000000-08')), '2020/2021');
select is((select cif.get_fiscal_year_from_timestamp('2021-02-01 16:21:42.000000-08')), '2020/2021');
-- Daylight savings in 2021 was Mar 14 - Nov 7
select is((select cif.get_fiscal_year_from_timestamp('2021-03-31 23:59:59.999999-07')), '2020/2021');
select is((select cif.get_fiscal_year_from_timestamp('2021-04-01 00:00:00.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-05-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-06-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-07-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-08-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-09-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-10-01 16:21:42.000000-07')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-11-01 16:21:42.000000-08')), '2021/2022');
select is((select cif.get_fiscal_year_from_timestamp('2021-12-01 16:21:42.000000-08')), '2021/2022');

select finish();

rollback;
