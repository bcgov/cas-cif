begin;
select plan(1);

select is((select cif_private.camel_to_snake_case('camelCaseText')), 'camel_case_text');

select finish();

rollback;
