begin;

do $$
  declare  temp_row record;

  begin
    for temp_row in select id from cif.project_revision loop

      update cif.project_revision
      set change_reason=concat('reason for change ', temp_row.id), change_status='committed'
      where id=temp_row.id;

    end loop;
  end
$$;
commit;
