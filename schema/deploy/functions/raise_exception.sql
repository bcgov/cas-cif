-- Deploy cif:functions/raise_exception to pg

begin;

create or replace function cif_private.raise_exception(text) returns text as
$$
begin
    raise exception '%',$1;
end;
$$ language plpgsql volatile;

grant execute on function cif_private.raise_exception to cif_internal, cif_external, cif_admin;

comment on function cif_private.raise_exception(text) is 'Raises an exception';

commit;
