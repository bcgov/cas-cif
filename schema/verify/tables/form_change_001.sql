-- Verify cif:tables/form_change_001 on pg

begin;

do $$
  begin
    assert (
      select  true
      from pg_catalog.pg_constraint con
      inner join pg_catalog.pg_class rel
        ON rel.oid = con.conrelid
      inner join pg_catalog.pg_namespace nsp
        ON nsp.oid = connamespace
      where nsp.nspname = 'cif'
        and rel.relname = 'form_change'
        and conname = 'form_change_json_schema_name_fkey'
    ), 'foreign key constraint "form_change_json_schema_name_fkey" is not defined';
  end;
$$;

rollback;
