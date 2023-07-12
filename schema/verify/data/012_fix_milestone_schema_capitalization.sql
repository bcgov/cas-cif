-- Verify cif:data/011_fix_milestone_schema_capitalization on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.form where slug = 'milestone' and json_schema::text like '%adjustedHoldbackAmount%') = 1
    ), 'adjustedHoldbackAmount is capitalized properly';
    assert (
      (select count(*) from cif.form where slug = 'milestone' and json_schema::text like '%adjustedHoldBackAmount%') = 0
    ), 'The improper capitalization field does not exist';
  end;
$$;

rollback;
