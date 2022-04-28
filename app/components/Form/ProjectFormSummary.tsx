import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import { ProjectFormSummary_query$key } from "__generated__/ProjectFormSummary_query.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";

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
          liveValidate
          theme={readOnlyTheme}
          schema={projectSchema as JSONSchema7}
          uiSchema={createProjectUiSchema(
            selectedOperator ? selectedOperator.node.legalName : "",
            selectedOperator ? selectedOperator.node.bcRegistryId : "",
            rfpStream
              ? `${rfpStream.node.fundingStreamByFundingStreamId.description} - ${rfpStream.node.year}`
              : "",
            projectStatus ? projectStatus.node.name : ""
          )}
          formData={projectFormChange.newFormData}
          formContext={{
            query: props.query,
            form: projectFormChange.newFormData,
          }}
        />
      )}
    </>
  );
};

export default ProjectFormSummary;
