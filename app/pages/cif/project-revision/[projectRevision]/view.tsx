import withRelayOptions from "lib/relay/withRelayOptions";
import { RelayProps, withRelay } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { viewProjectRevisionQuery } from "__generated__/viewProjectRevisionQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  projectRevisionSchema,
  projectRevisionUISchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { getLocaleFormattedDate } from "lib/theme/getLocaleFormattedDate";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import NotifyModal from "components/ProjectRevision/NotifyModal";

const createProjectRevisionViewSchema = (
  allRevisionTypes,
  allAmendmentStatuses
) => {
  const schema = projectRevisionSchema;
  schema.properties.revisionType = {
    ...schema.properties.revisionType,
    anyOf: allRevisionTypes.edges.map(({ node }) => {
      return {
        type: "string",
        title: node.type,
        enum: [node.type],
        value: node.type,
      } as JSONSchema7Definition;
    }),
  };

  schema.properties.amendmentStatus = {
    ...schema.properties.amendmentStatus,
    anyOf: allAmendmentStatuses.map(({ node }) => {
      return {
        type: "string",
        title: node.name,
        enum: [node.name],
        value: node.name,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

const createProjectRevisionUISchema = () => {
  const localUiSchema = JSON.parse(JSON.stringify(projectRevisionUISchema));
  localUiSchema.revisionType["ui:readonly"] = true;
  return localUiSchema;
};

export const ViewProjectRevisionQuery = graphql`
  query viewProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      ...NotifyModal_projectRevision
      pendingActionsFrom
      id
      revisionType
      createdAt
      amendmentStatus
      changeStatus
      cifUserByCreatedBy {
        fullName
      }
      updatedAt
      cifUserByUpdatedBy {
        fullName
      }
      typeRowNumber
      # eslint-disable-next-line relay/unused-fields
      changeReason
      pendingActionsFrom
      revisionStatus
      projectByProjectId {
        latestCommittedProjectRevision {
          ...TaskList_projectRevision
        }
      }
    }
    allRevisionTypes {
      edges {
        node {
          type
        }
      }
    }
    allAmendmentStatuses {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export function ProjectRevisionView({
  preloadedQuery,
}: RelayProps<{}, viewProjectRevisionQuery>) {
  const { session, projectRevision, allRevisionTypes, allAmendmentStatuses } =
    usePreloadedQuery(ViewProjectRevisionQuery, preloadedQuery);
  const taskList = (
    <TaskList
      projectRevision={
        projectRevision.projectByProjectId.latestCommittedProjectRevision
      }
      mode={"view"}
      projectRevisionUnderReview={projectRevision}
    />
  );
  // Growthbook - amendments
  if (!useShowGrowthbookFeature("amendments")) return null;

  // filtering to show only the amendment statuses that are allowed to be selected based on the revision type
  const filteredAmendmentStatuses = allAmendmentStatuses.edges.filter(
    ({ node }) =>
      projectRevision.revisionType === "Amendment"
        ? node.name !== "Applied"
        : ["Approved", "Draft"].includes(node.name)
  );

  return (
    <>
      <DefaultLayout session={session} leftSideNav={taskList}>
        <header>
          <h2>
            {projectRevision.revisionType} {projectRevision.typeRowNumber}
          </h2>
        </header>
        <div>
          <FormBase
            id={`form-${projectRevision.id}`}
            tagName={"dl"}
            className="project-revision-view-form"
            schema={
              createProjectRevisionViewSchema(
                allRevisionTypes,
                filteredAmendmentStatuses
              ) as JSONSchema7
            }
            uiSchema={createProjectRevisionUISchema()}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
            theme={readOnlyTheme}
            formData={projectRevision}
            formContext={{
              pendingActionsFrom: projectRevision.pendingActionsFrom,
              revisionId: projectRevision.id,
              revisionStatus: projectRevision.revisionStatus,
              changeStatus: projectRevision.changeStatus,
            }}
          ></FormBase>
          <NotifyModal projectRevision={projectRevision} />
          <div className="revision-record-history-section">
            <dt>Revision record history</dt>
            {projectRevision.updatedAt && (
              <dd>
                <em>Updated by </em>
                {projectRevision.cifUserByUpdatedBy?.fullName || "Unknown"}
                <em> on </em>
                {getLocaleFormattedDate(
                  projectRevision.updatedAt,
                  "DATETIME_MED"
                )}
              </dd>
            )}
            <dd>
              <em>Created by </em>
              {projectRevision.cifUserByCreatedBy?.fullName || "Unknown"}
              <em> on </em>
              {getLocaleFormattedDate(
                projectRevision.createdAt,
                "DATETIME_MED"
              )}
            </dd>
          </div>
        </div>
      </DefaultLayout>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section) {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section > dd) {
          margin-bottom: 0;
        }
        div :global(.revision-record-history-section > dd > em) {
          font-weight: bold;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
}
export default withRelay(
  ProjectRevisionView,
  ViewProjectRevisionQuery,
  withRelayOptions
);
