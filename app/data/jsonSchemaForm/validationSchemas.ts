import projectContactSchema from "./projectContactSchema";
import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";
import operatorSchema from "./operatorSchema";

const validationSchemas = {
  project_contact: projectContactSchema,
  project_manager: projectManagerSchema,
  project: projectSchema,
  contact: contactSchema,
  operator: operatorSchema,
};

export default validationSchemas;
