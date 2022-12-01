import ProjectContactForm from "components/Form/ProjectContactForm";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectForm from "components/Form/ProjectForm";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import ProjectMilestoneReportForm from "components/Form/ProjectMilestoneReportForm";
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
} from "../../lib/pages/formStructureFunctions";
import { IFormSection } from "./types";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import { useMemo } from "react";

export const useFormStructure: () => IFormSection[] = () => {
  const showTeimp = useShowGrowthbookFeature("teimp");

  return useMemo(
    () => [
      {
        title: "Project Overview",
        items: [
          {
            title: "Project Overview",
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
            title: "Project Managers",
            formConfiguration: {
              slug: "projectManagers",
              editComponent: ProjectManagerFormGroup,
              viewComponent: ProjectManagerFormSummary,
            },
          },
          {
            title: "Project Contacts",
            formConfiguration: {
              slug: "projectContacts",
              editComponent: ProjectContactForm,
              viewComponent: ProjectContactFormSummary,
            },
          },
        ],
      },
      {
        title: "Budgets, Expenses & Payments",
        items: [
          {
            title: "Budgets, Expenses & Payments",
            formConfiguration: {
              slug: "fundingAgreement",
              editComponent: ProjectFundingAgreementForm,
              viewComponent: ProjectFundingAgreementFormSummary,
            },
          },
        ],
      },
      {
        title: "Milestone Reports",
        formConfiguration: {
          slug: "projectMilestones",
          editComponent: ProjectMilestoneReportForm,
          viewComponent: ProjectMilestoneReportFormSummary,
        },
      },
      {
        title: "Quarterly Reports",
        items: [
          {
            title: "Quarterly Reports",
            formConfiguration: {
              slug: "quarterlyReports",
              editComponent: ProjectQuarterlyReportForm,
              viewComponent: ProjectQuarterlyReportFormSummary,
            },
          },
        ],
      },
      ...(showTeimp
        ? [
            {
              title: "Emissions Intensity Report",
              items: [
                {
                  title: "Emissions Intensity Report",
                  formConfiguration: {
                    slug: "teimp",
                    editComponent: ProjectEmissionIntensityReport,
                    viewComponent: ProjectEmissionIntensityReportSummary,
                  },
                },
              ],
            },
          ]
        : []),
      ,
      {
        title: "Annual Reports",
        items: [
          {
            title: "Annual Reports",
            formConfiguration: {
              slug: "annualReports",
              editComponent: ProjectAnnualReportForm,
              viewComponent: ProjectAnnualReportFormSummary,
            },
          },
        ],
      },
    ],
    [showTeimp]
  );
};

export const useNumberedFormStructure = () =>
  buildNumberedFormStructure(useFormStructure());
export const useFormPages = () => buildFormPages(useNumberedFormStructure());
