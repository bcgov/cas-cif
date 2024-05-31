-- Verify cif:tables/funding_stream_rfp_002 on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.funding_stream_rfp where year = 2024) = 2
    ), 'EP and IA streams have been added for 2024';
  end;
$$;

rollback;
