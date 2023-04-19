-- Verify cif:migrations/004_delete_revision_type_minor_revision on pg

begin;

  do $$
    begin
      assert (
        select count(*) = 0
        from cif.revision_type
        where type='Minor Revision'
      ), 'Minor Revision is not a valid revision_type';
    end;
  $$;


rollback;
