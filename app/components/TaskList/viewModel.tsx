import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import ProjectMilestoneReportFormGroup from "components/Form/ProjectMilestoneReportFormGroup";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";
import React from "react";

interface IFormConfiguration {
  slug: string;
  editComponent: React.FC;
  viewComponent: React.FC;
}
interface IFormItem<TFormConfiguration extends IFormConfiguration> {
  title: string;
  formConfiguration?: TFormConfiguration;
}
interface IFormSection<
  TFormConfiguration extends IFormConfiguration = IFormConfiguration
> extends IFormItem<TFormConfiguration> {
  optional?: boolean;
  items?: IFormItem<TFormConfiguration>[];
}
interface IIndexedFormConfiguration extends IFormConfiguration {
  formIndex: number;
}
interface INumberedFormSection extends IFormSection<IIndexedFormConfiguration> {
  sectionNumber: number;
}

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
const getNumberedFormStructure = (inputFormStructure: IFormSection[]) => {
  let currentSectionNumber = 1;
  let currentFormIndex = 0;

  let numberedSections = [] as INumberedFormSection[];

  inputFormStructure.forEach((section) => {
    const numberedSection: INumberedFormSection = {
      title: section.title,
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
  const items: T[] =
    section.items?.flatMap((item) => item.formConfiguration ?? []) ?? [];
  const sectionForm: T[] = [section.formConfiguration ?? []].flat();

  return [...sectionForm, ...items];
};

export const numberedFormStructure = getNumberedFormStructure(formStructure);
