begin;
select plan(1);

select is((select cif_private.snake_to_camel_case('camel_case_text')), 'camelCaseText');

select finish();

rollback;
