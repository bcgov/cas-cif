import projectContactSchema from "./projectContactSchema";
import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";
import contactSchema from "./contactSchema";

const validationSchemas = {
  project_contact: projectContactSchema,
  project_manager: projectManagerSchema,
  project: projectSchema,
  contact: contactSchema,
};

export default validationSchemas;
