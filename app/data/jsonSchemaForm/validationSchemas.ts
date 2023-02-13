import projectContactSchema from "./projectContactSchema";
import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";
import { milestoneSchema } from "./projectMilestoneSchema";
import { fundingParameterEPSchema } from "./fundingParameterEPSchema";
import { paymentSchema } from "./paymentSchema";
import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
} from "./projectEmissionIntensitySchema";
import additionalFundingSourceSchema from "./additionalFundingSourceSchema";
import { fundingParameterIASchema } from "./fundingParameterIASchema";

const validationSchemas = {
  project_contact: projectContactSchema,
  project_manager: projectManagerSchema,
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
  milestone_report: milestoneSchema,
  funding_parameter_EP: fundingParameterEPSchema,
  funding_parameter_IA: fundingParameterIASchema,
  payment: paymentSchema,
  emission_intensity_report: emissionIntensityReportSchema,
  emission_intensity_reporting_requirement:
    emissionIntensityReportingRequirementSchema,
  additional_funding_source: additionalFundingSourceSchema,
};

export default validationSchemas;
