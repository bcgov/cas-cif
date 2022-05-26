import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import ProjectMilestoneReportForm from "components/Form/ProjectMilestoneReportForm";
import ProjectQuarterlyReportForm from "components/Form/ProjectQuarterlyReportForm";
import ProjectAnnualReportForm from "components/Form/ProjectAnnualReportForm";

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
    title: "project managers",
    editComponent: ProjectManagerFormGroup,
    viewComponent: ProjectManagerFormSummary,
  },
  {
    title: "project contacts",
    editComponent: ProjectContactForm,
    viewComponent: ProjectContactFormSummary,
  },
  {
    title: "milestone reports",
    editComponent: ProjectMilestoneReportForm,
    // TODO: switch to ProjectMilestoneReportFormSummary when it's been merged
    viewComponent: null,
  },
  {
    title: "quarterly reports",
    editComponent: ProjectQuarterlyReportForm,
    // TODO: switch to ProjectQuarterlyReportFormSummary when it's been merged
    viewComponent: null,
  },
  {
    title: "annual reports",
    editComponent: ProjectAnnualReportForm,
    // TODO: switch to ProjectAnnualReportFormSummary when it's been merged
    viewComponent: null,
  },
];

export default formPages;
