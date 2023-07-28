-- Deploy cif:migration_rebuild_project_summary_report_history to pg

begin;

create or replace function cif_private.migration_rebuild_project_summary_report_history()
returns void as
$migration$

    with records as (
        select fc1.previous_form_change_id as prfid, fc2.form_data_record_id as fdrid, fc2.id as id2
        from cif.form_change as fc1
        join cif.form_change as fc2
        on fc1.previous_form_change_id=fc2.id
    )

    update cif.form_change set form_data_record_id=
        (
        select fdrid from records where prfid=id2 limit 1
        )
        where form_data_record_id is null
        and change_status='committed'
        and json_schema_name='project_summary_report';

$migration$ language sql volatile;

commit;
