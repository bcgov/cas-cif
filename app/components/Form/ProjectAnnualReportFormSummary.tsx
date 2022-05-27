import { utils } from "@rjsf/core";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportFormSummary_projectRevision$key } from "__generated__/ProjectAnnualReportFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";

// Remove this and import the one from app/lib/theme/getFilteredSchema.ts once it's merged in
const getFilteredSchema = (formSchema: JSONSchema7, formData) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const newDataObject = {};

  for (const key of Object.keys(filteredSchema.properties)) {
    if (
      formData.newFormData?.[key] ===
      formData.formChangeByPreviousFormChangeId?.newFormData?.[key]
    )
      delete filteredSchema.properties[key];
    else newDataObject[key] = formData.newFormData?.[key];
  }

  return { formSchema: filteredSchema, formData: newDataObject };
};

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectAnnualReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectAnnualReportFormSummary: React.FC<Props> = (props) => {
  const { summaryAnnualReportFormChanges, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectAnnualReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        id
        rowId
        summaryAnnualReportFormChanges: projectAnnualReportFormChanges {
          edges {
            node {
              rowId
              id
              isPristine
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the annual reports page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived reports
  let annualReportFormChanges = summaryAnnualReportFormChanges.edges;
  if (!renderDiff)
    annualReportFormChanges = summaryAnnualReportFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  // Sorting the annual report form changes by the reporting requirement index
  const [sortedAnnualReports] = useMemo(() => {
    const filteredReports = annualReportFormChanges.map(({ node }) => node);

    filteredReports.sort(
      (a, b) =>
        a.newFormData.reportingRequirementIndex -
        b.newFormData.reportingRequirementIndex
    );

    return [filteredReports];
  }, [annualReportFormChanges]);

  const allFormChangesPristine = useMemo(
    () =>
      !annualReportFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [annualReportFormChanges]
  );

  const annualReportsJSX = useMemo(() => {
    return sortedAnnualReports.map((annualReport, index) => {
      if (!annualReport) return;

      // Set the formSchema and formData based on showing the diff or not
      const { formSchema, formData } = !renderDiff
        ? {
            formSchema: projectReportingRequirementSchema,
            formData: annualReport.newFormData,
          }
        : getFilteredSchema(
            projectReportingRequirementSchema as JSONSchema7,
            annualReport
          );

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Annual Report {index + 1}</h4>
          </header>
          {/* Show this part if none of Annual report form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            annualReport.operation !== "ARCHIVE" && (
              <em>Annual report not updated</em>
            )}
          {/* Show this part if the whole Annual report has been removed */}
          {renderDiff && annualReport.operation === "ARCHIVE" ? (
            <em className="diffOld">Annual report removed</em>
          ) : (
            <FormBase
              liveValidate
              key={`form-${annualReport.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={formSchema as JSONSchema7}
              formData={formData}
              formContext={{
                operation: annualReport.operation,
                oldData:
                  annualReport.formChangeByPreviousFormChangeId?.newFormData,
              }}
            />
          )}
          <style jsx>{`
            .reportContainer {
              margin-bottom: 1em;
            }
            diffOld {
              color: #fad980;
            }
          `}</style>
        </div>
      );
    });
  }, [sortedAnnualReports, renderDiff]);

  return (
    <>
      <h3>Project Annual Reports</h3>
      {allFormChangesPristine && props.viewOnly ? (
        <p>
          <em>
            Project annual reports not {isFirstRevision ? "added" : "updated"}
          </em>
        </p>
      ) : (
        annualReportsJSX
      )}
    </>
  );
};

export default ProjectAnnualReportFormSummary;
