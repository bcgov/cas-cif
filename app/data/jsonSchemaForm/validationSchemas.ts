import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";
import { paymentSchema } from "./paymentSchema";
import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
} from "./projectEmissionIntensitySchema";
import additionalFundingSourceSchema from "./additionalFundingSourceSchema";
import { fundingParameterEPSchema } from "./fundingParameterEPSchema";
import { fundingParameterIASchema } from "./fundingParameterIASchema";
import { projectSummaryReportSchema } from "./projectSummaryReportSchema";

const validationSchemas = {
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
  funding_parameter_EP: fundingParameterEPSchema,
  funding_parameter_IA: fundingParameterIASchema,
  payment: paymentSchema,
  emission_intensity_report: emissionIntensityReportSchema,
  emission_intensity_reporting_requirement:
    emissionIntensityReportingRequirementSchema,
  additional_funding_source: additionalFundingSourceSchema,
  project_summary_report: projectSummaryReportSchema,
};

export default validationSchemas;
