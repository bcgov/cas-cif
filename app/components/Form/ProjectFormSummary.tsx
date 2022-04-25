import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import { ProjectFormSummary_query$key } from "__generated__/ProjectFormSummary_query.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";
import CUSTOM_FIELDS from "lib/theme/CustomFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
  query: ProjectFormSummary_query$key;
  projectRevision: ProjectFormSummary_projectRevision$key;
}

const ProjectFormSummary: React.FC<Props> = (props) => {
  const { projectFormChange } = useFragment(
    graphql`
      fragment ProjectFormSummary_projectRevision on ProjectRevision {
        projectFormChange {
          newFormData
          formChangeByPreviousFormChangeId {
            newFormData
          }
        }
      }
    `,
    props.projectRevision
  );

  const { allFundingStreamRfps, allOperators, allProjectStatuses } =
    useFragment(
      graphql`
        fragment ProjectFormSummary_query on Query {
          allFundingStreamRfps {
            edges {
              node {
                fundingStreamByFundingStreamId {
                  name
                  description
                }
                rowId
                year
              }
            }
          }
          allOperators {
            edges {
              node {
                rowId
                legalName
                bcRegistryId
              }
            }
          }
          allProjectStatuses {
            edges {
              node {
                name
                rowId
              }
            }
          }
        }
      `,
      props.query
    );

  const isOverviewEmpty = useMemo(() => {
    return Object.keys(projectFormChange.newFormData).length === 0;
  }, [projectFormChange.newFormData]);

  // Get display values for ID fields
  const selectedOperator = useMemo(() => {
    return allOperators.edges.find(
      ({ node }) => node.rowId === projectFormChange.newFormData.operatorId
    );
  }, [allOperators, projectFormChange.newFormData.operatorId]);

  const rfpStream = useMemo(() => {
    return allFundingStreamRfps.edges.find(
      ({ node }) =>
        node.rowId === projectFormChange.newFormData.fundingStreamRfpId
    );
  }, [allFundingStreamRfps, projectFormChange.newFormData.fundingStreamRfpId]);

  const projectStatus = useMemo(() => {
    return allProjectStatuses.edges.find(
      ({ node }) => node.rowId === projectFormChange.newFormData.projectStatusId
    );
  }, [allProjectStatuses, projectFormChange.newFormData.projectStatusId]);

  // Get display values for ID fields (previous revision data)
  const oldOperator = useMemo(() => {
    return allOperators.edges.find(
      ({ node }) =>
        node.rowId ===
        projectFormChange.formChangeByPreviousFormChangeId?.newFormData
          ?.operatorId
    );
  }, [
    allOperators.edges,
    projectFormChange.formChangeByPreviousFormChangeId?.newFormData?.operatorId,
  ]);

  const oldRfpStream = useMemo(() => {
    return allFundingStreamRfps.edges.find(
      ({ node }) =>
        node.rowId ===
        projectFormChange.formChangeByPreviousFormChangeId?.newFormData
          ?.fundingStreamRfpId
    );
  }, [
    allFundingStreamRfps.edges,
    projectFormChange.formChangeByPreviousFormChangeId?.newFormData
      ?.fundingStreamRfpId,
  ]);

  const oldProjectStatus = useMemo(() => {
    return allProjectStatuses.edges.find(
      ({ node }) =>
        node.rowId ===
        projectFormChange.formChangeByPreviousFormChangeId?.newFormData
          ?.projectStatusId
    );
  }, [
    allProjectStatuses.edges,
    projectFormChange.formChangeByPreviousFormChangeId?.newFormData
      ?.projectStatusId,
  ]);

  const oldUiSchema = createProjectUiSchema(
    oldOperator ? oldOperator.node.legalName : "",
    oldOperator ? oldOperator.node.bcRegistryId : "",
    oldRfpStream
      ? `${oldRfpStream.node.fundingStreamByFundingStreamId.description} - ${oldRfpStream.node.year}`
      : "",
    oldProjectStatus ? oldProjectStatus.node.name : ""
  );

  // Filter out fields that have not changed from the previous revision
  const filteredSchema = JSON.parse(JSON.stringify(projectSchema));
  const filteredFormData = useMemo(() => {
    const newDataObject = {};
    for (const [key, value] of Object.entries(projectFormChange.newFormData)) {
      if (
        value ===
        projectFormChange.formChangeByPreviousFormChangeId?.newFormData?.[key]
      )
        delete filteredSchema.properties[key];
      else newDataObject[key] = value;
    }
    return newDataObject;
  }, [
    filteredSchema.properties,
    projectFormChange.formChangeByPreviousFormChangeId?.newFormData,
    projectFormChange.newFormData,
  ]);

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_FIELDS };
  // Has any data changed since the last revision
  const isPristine = false;
  if (isPristine)
    return (
      <>
        <h3>Project Overview</h3>
        <p>
          <em>Project overview not updated</em>
        </p>
      </>
    );

  return (
    <>
      <h3>Project Overview</h3>
      {isOverviewEmpty ? (
        <p>
          <em>Project overview not added</em>
        </p>
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={customFields}
          schema={filteredSchema as JSONSchema7}
          uiSchema={createProjectUiSchema(
            selectedOperator ? selectedOperator.node.legalName : "",
            selectedOperator ? selectedOperator.node.bcRegistryId : "",
            rfpStream
              ? `${rfpStream.node.fundingStreamByFundingStreamId.description} - ${rfpStream.node.year}`
              : "",
            projectStatus ? projectStatus.node.name : ""
          )}
          formData={filteredFormData}
          formContext={{
            oldData:
              projectFormChange.formChangeByPreviousFormChangeId?.newFormData,
            oldUiSchema,
          }}
        />
      )}
    </>
  );
};

export default ProjectFormSummary;
