-- Verify cif:tables/project_003_add_immutable_funding_stream_trigger on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.triggers
      where trigger_schema='cif' and event_object_table='project' and trigger_name = 'project_funding_stream_rfp_id_is_immutable'
    ), 'trigger "project_funding_stream_rfp_id_is_immutable" is defined on table "project"';
  end;
$$;

rollback;
