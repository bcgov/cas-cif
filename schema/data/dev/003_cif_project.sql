begin;


do $$
  begin
    for project_id in 1..50 loop
      insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary, project_name, total_funding_request) values
      (
        project_id % 3 + 1,
        1,
        project_id % 3 + 1,
        lpad(project_id::text, 3, '0'),
        'lorem ipsum dolor sit amet consectetur adipiscing elit',
        'test project ' || lpad(project_id::text, 3, '0'),
        project_id * 1000
        );
    end loop;
  end
$$;

commit;
