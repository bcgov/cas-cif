-- Deploy cif:tables/project_003_add_immutable_funding_stream_trigger to pg

begin;

create trigger project_funding_stream_rfp_id_is_immutable
    before update on cif.project
    for each row
    execute procedure cif_private.funding_stream_is_immutable();

commit;
