import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import ProjectMilestoneReportFormGroup from "components/Form/ProjectMilestoneReportFormGroup";
import ProjectQuarterlyReportForm from "components/Form/ProjectQuarterlyReportForm";
import ProjectAnnualReportForm from "components/Form/ProjectAnnualReportForm";
import ProjectQuarterlyReportFormSummary from "components/Form/ProjectQuarterlyReportFormSummary";
import ProjectAnnualReportFormSummary from "components/Form/ProjectAnnualReportFormSummary";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";
import ProjectFundingAgreementForm from "components/Form/ProjectFundingAgreementForm";
import ProjectFundingAgreementFormSummary from "components/Form/ProjectFundingAgreementFormSummary";
import ProjectEmissionIntensityReport from "components/Form/ProjectEmissionIntensityReportForm";
import ProjectEmissionIntensityReportSummary from "components/Form/ProjectEmissionIntensityReportFormSummary";
import {
  buildFormPages,
  buildNumberedFormStructure,
} from "./formStructureFunctions";
import { IFormSection } from "./types";

const formStructure: IFormSection[] = [
  {
    title: "Project Overview",
    items: [
      {
        title: "Project overview",
        formConfiguration: {
          slug: "projectOverview",
          editComponent: ProjectForm,
          viewComponent: ProjectFormSummary,
        },
      },
    ],
  },
  {
    title: "Project Details",
    optional: true,
    items: [
      {
        title: "Project managers",
        formConfiguration: {
          slug: "projectManagers",
          editComponent: ProjectManagerFormGroup,
          viewComponent: ProjectManagerFormSummary,
        },
      },
      {
        title: "Project contacts",
        formConfiguration: {
          slug: "projectContacts",
          editComponent: ProjectContactForm,
          viewComponent: ProjectContactFormSummary,
        },
      },
    ],
  },
  {
    title: "Milestone Reports",
    formConfiguration: {
      slug: "projectMilestones",
      editComponent: ProjectMilestoneReportFormGroup,
      viewComponent: ProjectMilestoneReportFormSummary,
    },
  },
];

export const numberedFormStructure = buildNumberedFormStructure(formStructure);
export const formPages = buildFormPages(numberedFormStructure);
