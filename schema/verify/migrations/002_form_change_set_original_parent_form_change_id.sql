-- Verify cif:migrations/002_form_change_set_original_parent_form_change_id on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.form_change
        where
          previous_form_change_id is not null and original_parent_form_change_id is null
      ), 'form_change records from before the original_parent_form_change_id column existed have it populated with previous_form_change_id';
    end;
  $$;


rollback;

