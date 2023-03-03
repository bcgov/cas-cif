import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";
import { paymentSchema } from "./paymentSchema";
import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
} from "./projectEmissionIntensitySchema";
import additionalFundingSourceSchema from "./additionalFundingSourceSchema";

const validationSchemas = {
  project_manager: projectManagerSchema,
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
  payment: paymentSchema,
  emission_intensity_report: emissionIntensityReportSchema,
  emission_intensity_reporting_requirement:
    emissionIntensityReportingRequirementSchema,
  additional_funding_source: additionalFundingSourceSchema,
};

export default validationSchemas;
