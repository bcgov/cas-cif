-- Verify cif:migrations/005_attachment_data_into_project_attachment_table.sql on pg

begin;

  do $$
    begin
      assert (
        (select count(*) from cif.project_attachment) = (select count(*) from cif.attachment)
      ), 'The number of data inserted into cif.project_attachment does not match the data from cif.attachment.';
      assert (
        (select count(*) from cif.project_attachment pa join cif.attachment a on pa.attachment_id = a.id where pa.project_id = a.project_id) = (select count(*) from cif.attachment)
      ), 'All attachment ids do not match project attachment ids.';
    end;
  $$;

rollback;
