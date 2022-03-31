begin;

do $$
  begin
    for index in 1..50 loop
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        change_status,
        json_schema_name
      )
      values
      (
        json_build_object(
          'operatorId', '2',
          'fundingStreamRfpId', '1',
          'projectStatusId', '1',
          'proposalReference', lpad(index::text, 3, '0'),
          'summary', 'lorem ipsum dolor sit amet adipiscing eli',
          'projectName', 'TEST-PROJECT-' || lpad(index::text, 3, '0'),
          'totalFundingRequest', rpad(index::text, 3, '0')
          ),
        'create', 'cif', 'project', 'committed', 'project');
    end loop;
  end
$$;
commit
