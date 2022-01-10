begin;

insert into cif.project(operator_id, funding_stream_rfp_id, rfp_number, summary, project_name) values
(1, 1, '2019-RFP-1-000-ABCD', 'summary', 'project 1'),
(2, 1, '2019-RFP-0-000-EFGH', 'summary', 'project 2'),
(3, 1, '2019-RFP-0-000-ZXCV', 'summary', 'project 3'),
(1, 1, '2019-RFP-0-000-ABCD', 'summary', 'lorem ipsum dolor sit amet consectetur adipiscing elit');

commit;
