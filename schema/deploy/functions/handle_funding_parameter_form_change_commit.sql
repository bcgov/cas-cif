-- Deploy cif:functions/handle_funding_parameter_form_change_commit to pg
-- requires: tables/form_change


begin;

create or replace function cif_private.handle_funding_parameter_form_change_commit(fc cif.form_change)
  returns int as $$
declare
  funding_parameter_record_id int;
  element jsonb;
  json_data jsonb;
  -- iterator int;
begin

  -- If there is no change in the form data, return the form_change record and do not touch the associated table.
  if (fc.new_form_data = '{}') then
    return fc.form_data_record_id; -- can be null if creating with empty form data...problem?
  end if;

  if (fc.change_status = 'committed') then
    raise exception 'Cannot commit form_change. It has already been committed.';
  end if;

  funding_parameter_record_id := $1.form_data_record_id;

  if fc.operation = 'create' then

  insert into cif.funding_parameter(
      project_id,
      max_funding_amount,
      province_share_percentage,
      holdback_percentage,
      anticipated_funding_amount,
      proponent_cost,
      contract_start_date,
      project_assets_life_end_date)
    values(
        (select form_data_record_id from cif.form_change where form_data_table_name = 'project' and project_revision_id = $1.project_revision_id),
        (fc.new_form_data->>'maxFundingAmount')::int,
        (fc.new_form_data->>'provinceSharePercentage')::int,
        (fc.new_form_data->>'holdbackPercentage')::int,
        (fc.new_form_data->>'anticipatedFundingAmount')::int,
        (fc.new_form_data->>'proponentCost')::int,
        (fc.new_form_data->>'contractStartDate')::timestamptz,
        (fc.new_form_data->>'projectAssetsLifeEndDate')::timestamptz
    ) returning id into funding_parameter_record_id;

    -- iterator := 1;

    -- for element in select jsonb_array_elements((fc.new_form_data->>'additionalFundingSources')::jsonb)
    --   loop
    --     -- Grab the JSON data for the current element.
    --     json_data := element;
        insert into cif.additional_funding_source(
          project_id,
          status,
          source,
          amount,
          source_index
          )
        select
          (select form_data_record_id from cif.form_change where form_data_table_name = 'project' and project_revision_id = $1.project_revision_id),
          (value::jsonb->>'status'),
          (value::jsonb->>'source'),
          (value::jsonb->>'amount')::int,
          row_number () over ()
        from jsonb_array_elements(($1.new_form_data->>'additionalFundingSources')::jsonb);


    update cif.form_change set form_data_record_id = funding_parameter_record_id where id = fc.id;

  elsif fc.operation = 'update' then

    update cif.funding_parameter fp set
        max_funding_amount = (fc.new_form_data->>'maxFundingAmount')::int,
        province_share_percentage = (fc.new_form_data->>'provinceSharePercentage')::int,
        holdback_percentage = (fc.new_form_data->>'holdbackPercentage')::int,
        anticipated_funding_amount = (fc.new_form_data->>'anticipatedFundingAmount')::int,
        proponent_cost = (fc.new_form_data->>'proponentCost')::int,
        contract_start_date = (fc.new_form_data->>'contractStartDate')::timestamptz,
        project_assets_life_end_date =(fc.new_form_data->>'projectAssetsLifeEndDate')::timestamptz
    where fp.id = fc.form_data_record_id;


-- insert on conflict, remove ones with index higher than count



  -- if there are fewer additionalFundingSources in the updated
  update cif.additional_funding_source afs
    set archived_at = now()
    where afs.project_id = (
      select form_data_record_id
      from cif.form_change
      where form_data_table_name = 'project' and project_revision_id = $1.project_revision_id)
    and afs.source_index > (
          select count(*)
          from jsonb_array_elements(($1.new_form_data->>'additionalFundingSources')::jsonb))
    and afs.archived_at is null
    ;

      insert into cif.additional_funding_source(
          project_id,
          status,
          source,
          amount,
          source_index
          )
        select
          (select form_data_record_id from cif.form_change where form_data_table_name = 'project' and project_revision_id = $1.project_revision_id),
          (value::jsonb->>'status'),
          (value::jsonb->>'source'),
          (value::jsonb->>'amount')::int,
          row_number () over ()
        from jsonb_array_elements(($1.new_form_data->>'additionalFundingSources')::jsonb)
        on conflict(project_id, source_index) where archived_at is null do update set
        status = excluded.status,
        source = excluded.source,
        amount = excluded.amount;


  elsif fc.operation = 'archive' then

    update cif.funding_parameter set archived_at = now() where id = fc.form_data_record_id;
    update cif.additional_funding_source set archived_at = now() where id = fc.form_data_record_id;

  end if;

  return funding_parameter_record_id;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.handle_funding_parameter_form_change_commit to cif_internal, cif_external, cif_admin;

comment on function cif_private.handle_funding_parameter_form_change_commit
  is $$
    The custom function used to parse funding_parameter form_change data into table data.
    The data within the single form_change record is parsed into the funding_parameter and payment tables.
  $$;

commit;
