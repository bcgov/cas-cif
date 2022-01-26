import getProjectManagerSchema from "./projectManagerSchema";
import getProjectSchema from "./projectSchema";

const validationSchemas = {
  project_manager: getProjectManagerSchema,
  project: getProjectSchema,
};

export default validationSchemas;
