import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";

interface FormPageDefinition {
  title: string;
  editComponent; // TODO: can we require this attribute, but let typescript infer the type?
  viewComponent;
}

const formPages: FormPageDefinition[] = [
  {
    title: "project overview",
    editComponent: ProjectForm,
    viewComponent: ProjectFormSummary,
  },
  {
    title: "project contacts",
    editComponent: ProjectContactForm,
    viewComponent: ProjectContactFormSummary,
  },
  {
    title: "project managers",
    editComponent: ProjectManagerFormGroup,
    viewComponent: ProjectManagerFormSummary,
  },
];

export default formPages;
