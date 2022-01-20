begin;

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary, project_name) values
(1, 1, 1, '000', 'summary', 'project 1'),
(2, 1, 1, '000', 'summary', 'project 2'),
(3, 1, 1, '000', 'summary', 'project 3'),
(1, 1, 1, '001', 'summary', 'lorem ipsum dolor sit amet consectetur adipiscing elit');

commit;
