import projectContactSchema from "./projectContactSchema";
import { projectReportingRequirementSchema } from "./projectReportingRequirementSchema";
import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";
import { milestoneSchema } from "./projectMilestoneSchema";
import { fundingAgreementSchema } from "./fundingAgreementSchema";
import { paymentSchema } from "./paymentSchema";
import { projectEmissionIntensitySchema } from "./projectEmissionIntensitySchema";

const validationSchemas = {
  project_contact: projectContactSchema,
  project_manager: projectManagerSchema,
  reporting_requirement: projectReportingRequirementSchema,
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
  milestone_report: milestoneSchema,
  funding_parameter: fundingAgreementSchema,
  payment: paymentSchema,
  emission_intensity_report: projectEmissionIntensitySchema,
};

export default validationSchemas;
