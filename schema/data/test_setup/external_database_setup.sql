create user foreign_user with password 'foreign_password';
grant all privileges on database foreign_test_db to foreign_user;
create schema swrs;
create table swrs.organisation (
  id integer,
  report_id integer,
  swrs_organisation_id integer,
  business_legal_name varchar(1000),
  english_trade_name varchar(1000)
);

create table swrs.report (
  id integer,
  swrs_organisation_id integer,
  reporting_period_duration integer
);

insert into swrs.report(id, swrs_organisation_id, reporting_period_duration) values (1, 1, 2019), (2, 1, 2020), (3, 2, 2020), (4, 3, 2020);

insert into swrs.organisation(id, report_id, swrs_organisation_id, business_legal_name, english_trade_name)
values
(1, 1, 1, '2019 legal name 1', '2019 legal name 1'),
(2, 2, 1, '2020 legal name 1', '2020 trade name 1'),
(3, 3, 2, '2020 legal name 2', '2020 trade name 2'),
(4, 4, 3, '2020 legal name 3', '2020 trade name 3');

grant usage on schema swrs to foreign_user;
grant select on all tables in schema swrs to foreign_user;
grant insert on all tables in schema swrs to foreign_user;
