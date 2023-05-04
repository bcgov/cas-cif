begin;

-- cif.cif_user should not be truncated or else all tables should be (since they all have a created_by column)
truncate table
  cif.form_change,
  cif.project_revision,
  cif.project,
  cif.project_contact,
  cif.contact,
  cif.project_manager,
  cif.operator,
  cif.attachment,
  cif.emission_intensity_report,
  cif.milestone_report,
  cif.reporting_requirement,
  cif.payment,
  cif.funding_parameter,
  cif.additional_funding_source,
  cif.project_revision_amendment_type,
  cif.project_attachment
restart identity;


commit;
