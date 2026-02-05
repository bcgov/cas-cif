-- Verify cif:tables/funding_stream_rfp_003 on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.funding_stream_rfp where year = 2025) = 2
    ), 'EP and IA streams have been added for 2025';
  end;
$$;

rollback;
