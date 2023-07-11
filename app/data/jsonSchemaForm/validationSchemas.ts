import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import { paymentSchema } from "./paymentSchema";
import additionalFundingSourceSchema from "./additionalFundingSourceSchema";

const validationSchemas = {
  project: projectSchema,
  contact: contactSchema,
  payment: paymentSchema,
  additional_funding_source: additionalFundingSourceSchema,
};

export default validationSchemas;
