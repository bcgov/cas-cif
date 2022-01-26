import projectManagerSchema from "./projectManagerSchema";
import projectSchema from "./projectSchema";

const validationSchemas = {
  project_manager: projectManagerSchema,
  project: projectSchema,
};

export default validationSchemas;
