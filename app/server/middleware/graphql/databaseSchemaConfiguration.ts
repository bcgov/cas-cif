/**
 *  This is a list of schema names that live in the database and
 *  not as static json data in the code.
 *  The validation plugin will try to fetch them from the cif.form table
 *  instead of using the static json schema.
 */
const DATABASE_SCHEMAS = [
  "milestone",
  "reporting_requirement",
  "project_contact",
  "project_manager",
  "project_summary_report",
  "operator",
  "funding_parameter_EP",
  "funding_parameter_IA",
];

export default DATABASE_SCHEMAS;
