begin;
select plan(12);

select is((select cif.get_fiscal_year_from_timestamp('2000-01-01 16:21:42.693489-07')), '1999/2000');
select is((select cif.get_fiscal_year_from_timestamp('2000-02-01 16:21:42.693489-07')), '1999/2000');
select is((select cif.get_fiscal_year_from_timestamp('2000-03-01 23:59:59.693489-07')), '1999/2000');
select is((select cif.get_fiscal_year_from_timestamp('2000-04-01 00:00:00.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-05-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-06-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-07-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-08-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-09-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-10-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-11-01 16:21:42.693489-07')), '2000/2001');
select is((select cif.get_fiscal_year_from_timestamp('2000-12-01 16:21:42.693489-07')), '2000/2001');

select finish();

rollback;
