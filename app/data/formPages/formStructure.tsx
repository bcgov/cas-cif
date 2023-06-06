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
import ProjectSummaryReportForm from "components/Form/ProjectSummaryReportForm";
import ProjectSummaryReportFormSummary from "components/Form/ProjectSummaryReportFormSummary";
import {
  buildFormPages,
  buildNumberedFormStructure,
} from "../../lib/pages/formStructureFunctions";
import { IFormSection } from "./types";
import { useMemo } from "react";
import ProjectAttachmentsFormSummary from "components/Form/ProjectAttachmentsFormSummary";
import ProjectAttachmentsForm from "components/Form/ProjectAttachmentsForm";

export const useFormStructure: (fundingStream: String) => IFormSection[] = (
  fundingStream: String
) => {
  const showEP = fundingStream == "EP" ? true : false;
  const showIA = fundingStream == "IA" ? true : false;

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
      ...(showEP
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
      ...(showEP
        ? [
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
          ]
        : []),
      ...(showIA
        ? [
            {
              title: "Project Summary Report",
              items: [
                {
                  title: "Project Summary Report",
                  formConfiguration: {
                    slug: "projectSummaryReport",
                    editComponent: ProjectSummaryReportForm,
                    viewComponent: ProjectSummaryReportFormSummary,
                  },
                },
              ],
            },
          ]
        : []),
      ,
      ,
      {
        title: "Project Attachments",
        items: [
          {
            title: "Project Attachments",
            formConfiguration: {
              slug: "projectAttachments",
              editComponent: ProjectAttachmentsForm,
              viewComponent: ProjectAttachmentsFormSummary,
            },
          },
        ],
      },
    ],
    [showEP, showIA]
  );
};

export const useNumberedFormStructure = (fundingStream: String) =>
  buildNumberedFormStructure(useFormStructure(fundingStream));
export const useFormPages = (fundingStream: String) =>
  buildFormPages(useNumberedFormStructure(fundingStream));
