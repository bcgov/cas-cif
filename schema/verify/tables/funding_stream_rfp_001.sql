-- Verify cif:tables/funding_stream_rfp_001 on pg

begin;

do $$
  begin
    assert (
      (select count(*) from cif.funding_stream_rfp where year = 2023) = 2
    ), 'EP and IA streams have been added for 2023';
  end;
$$;

rollback;
