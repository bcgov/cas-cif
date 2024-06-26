begin;

select plan(5);

select has_function('cif', 'jsonb_minus', 'function cif.jsonb_minus exists');

select is(
  (select * from cif.jsonb_minus('{"a": 0, "b": 0, "c": 0}'::jsonb, '{"a": 0, "b": 0, "c": 0}'::jsonb)),
  NULL,
  'The difference of two identical objects is NULL'
);

select is(
  (select * from cif.jsonb_minus('{"a": 1, "b": 0, "c": null}'::jsonb, '{"a": 0, "b": 0, "c": 0}'::jsonb)),
  '{"a": 1, "c": null}'::jsonb,
  'All fields that are changed are returned'
);

select is(
  (select * from cif.jsonb_minus('{"a": 1, "b": 0, "c": 1, "d": null}'::jsonb, '{"a": 0, "b": 0}'::jsonb)),
  '{"a": 1, "c": 1, "d": null}'::jsonb,
  'Added fields are included in the return value, including when their value is null'
);

select is(
  (select * from cif.jsonb_minus('{"a": 1, "b": 0}'::jsonb, '{"a": 1, "b": 2, "d": "test value"}'::jsonb)),
  '{"b": 0}'::jsonb,
  'Extra fields in the subtrahend are properly ignored'
);

select finish();

rollback;
