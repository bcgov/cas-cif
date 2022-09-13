import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import ProjectMilestoneReportFormGroup from "components/Form/ProjectMilestoneReportFormGroup";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";
import {
  IFormConfiguration,
  IFormSection,
  INumberedFormSection,
} from "./types";

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

// We walk through the structure to number everything with section numbers and form indices
const buildNumberedFormStructure = (inputFormStructure: IFormSection[]) => {
  let currentSectionNumber = 1;
  let currentFormIndex = 0;

  let numberedSections = [] as INumberedFormSection[];

  inputFormStructure.forEach((section) => {
    const numberedSection: INumberedFormSection = {
      title: section.title,
      optional: section.optional,
      sectionNumber: currentSectionNumber++,
      formConfiguration: section.formConfiguration
        ? {
            ...section.formConfiguration,
            formIndex: currentFormIndex++,
          }
        : undefined,
      items: section.items?.map((item) => {
        return {
          title: item.title,
          formConfiguration: item.formConfiguration && {
            ...item.formConfiguration,
            formIndex: currentFormIndex++,
          },
        };
      }),
    };

    numberedSections.push(numberedSection);
  });

  return numberedSections;
};

export const getFormsInSection = function <T extends IFormConfiguration>(
  section: IFormSection<T>
) {
  const items: IFormSection<T>[] = section.items?.map((i) => i) ?? [];

  // We only return the non-null formcongiguration items
  return [section, ...items].filter((s) => s.formConfiguration);
};

export const numberedFormStructure = buildNumberedFormStructure(formStructure);
