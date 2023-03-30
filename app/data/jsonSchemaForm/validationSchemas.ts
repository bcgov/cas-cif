import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import { paymentSchema } from "./paymentSchema";
import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
} from "./projectEmissionIntensitySchema";
import additionalFundingSourceSchema from "./additionalFundingSourceSchema";
import { fundingParameterEPSchema } from "./fundingParameterEPSchema";
import { fundingParameterIASchema } from "./fundingParameterIASchema";

const validationSchemas = {
  project: projectSchema,
  contact: contactSchema,
  funding_parameter_EP: fundingParameterEPSchema,
  funding_parameter_IA: fundingParameterIASchema,
  payment: paymentSchema,
  emission_intensity_report: emissionIntensityReportSchema,
  emission_intensity_reporting_requirement:
    emissionIntensityReportingRequirementSchema,
  additional_funding_source: additionalFundingSourceSchema,
};

export default validationSchemas;
