-- Revert cif:tables/project_003_add_immutable_funding_stream_trigger from pg

begin;

drop trigger if exists project_funding_stream_rfp_id_is_immutable on cif.project;

commit;
