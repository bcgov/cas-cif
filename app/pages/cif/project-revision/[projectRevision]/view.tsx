import FormBase from "components/Form/FormBase";
import DefaultLayout from "components/Layout/DefaultLayout";
import ChangeReasonWidget from "components/ProjectRevision/ChangeReasonWidget";
import RevisionRecordHistory from "components/ProjectRevision/RevisionRecordHistory";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import UpdatedFormsWidget from "components/ProjectRevision/UpdatedFormsWidget";
import TaskList from "components/TaskList";
import {
  viewProjectRevisionSchema,
  projectRevisionUISchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { viewProjectRevisionQuery } from "__generated__/viewProjectRevisionQuery.graphql";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { viewProjectRevisionQuery$data } from "__generated__/viewProjectRevisionQuery.graphql";
import DangerAlert from "lib/theme/ConfirmationAlert";
import { Button } from "@button-inc/bcgov-theme";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "routes/pageRoutes";
import { useState } from "react";

export const ViewProjectRevisionQuery = graphql`
  query viewProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      id
      rowId
      revisionType
      revisionStatus
      typeRowNumber
      # eslint-disable-next-line relay/unused-fields
      changeReason
      projectByProjectId {
        latestCommittedProjectRevision {
          id
          ...TaskList_projectRevision
        }
      }
      ...RevisionStatusWidget_projectRevision
      ...SelectWithNotifyWidget_projectRevision
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...CollapsibleFormWidget_projectRevision
      ...UpdatedFormsWidget_projectRevision
      ...ChangeReasonWidget_projectRevision
      ...RevisionRecordHistory_projectRevision
    }
    allRevisionTypes {
      # type is passed to the helper function that builds the schema
      # eslint-disable-next-line relay/unused-fields
      edges {
        node {
          type
        }
      }
    }
    allRevisionStatuses(orderBy: SORTING_ORDER_ASC) {
      # node is passed to the helper function that builds the schema
      # eslint-disable-next-line relay/unused-fields
      edges {
        node {
          name
          isAmendmentSpecific
        }
      }
    }
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...ProjectFundingAgreementFormSummary_query
  }
`;

export const buildProjectRevisionSchema = (
  allRevisionTypesEdges: viewProjectRevisionQuery$data["allRevisionTypes"]["edges"],
  allRevisionStatusesEdges: viewProjectRevisionQuery$data["allRevisionStatuses"]["edges"],
  revisionType: string
): JSONSchema7 => {
  const schema = viewProjectRevisionSchema;
  schema.properties.revisionType = {
    ...schema.properties.revisionType,
    anyOf: allRevisionTypesEdges.map(({ node }) => {
      return {
        type: "string",
        title: node.type,
        enum: [node.type],
        value: node.type,
      } as JSONSchema7Definition;
    }),
  };

  schema.properties.revisionStatus = {
    ...schema.properties.revisionStatus,
    anyOf: allRevisionStatusesEdges.map(({ node }) => {
      return {
        type: "string",
        // relabel "Applied" to "Approved" for amendments
        title:
          revisionType === "Amendment" && node.name === "Applied"
            ? "Approved"
            : node.name,
        enum: [node.name],
        value: node.name,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

export const createProjectRevisionUISchema = (uiSchema) => {
  const localUiSchema = JSON.parse(JSON.stringify(uiSchema));
  localUiSchema.revisionType["ui:readonly"] = true;
  return localUiSchema;
};

export function ProjectRevisionView({
  preloadedQuery,
}: RelayProps<{}, viewProjectRevisionQuery>) {
  const router = useRouter();
  const query = usePreloadedQuery(ViewProjectRevisionQuery, preloadedQuery);
  const { session, projectRevision, allRevisionTypes, allRevisionStatuses } =
    query;
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const taskList = (
    <TaskList
      // This ensures that when a user clicks on the tasklist, they see the latest data for a project, even if they're accessing the tasklist from an old revision
      projectRevision={
        projectRevision.projectByProjectId.latestCommittedProjectRevision
      }
      mode={"view"}
      projectRevisionUnderReview={projectRevision}
    />
  );

  const discardRevision = async () => {
    await discardProjectRevision({
      variables: {
        input: {
          revisionId: query.projectRevision.rowId,
        },
      },
      onCompleted: async () => {
        await router.push(
          getProjectRevisionPageRoute(
            query.projectRevision.projectByProjectId
              .latestCommittedProjectRevision.id
          )
        );
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  // Growthbook - amendments
  if (!useShowGrowthbookFeature("amendments")) return null;

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
            schema={buildProjectRevisionSchema(
              allRevisionTypes.edges,
              allRevisionStatuses.edges,
              projectRevision.revisionType
            )}
            uiSchema={createProjectRevisionUISchema(projectRevisionUISchema)}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
            theme={readOnlyTheme}
            formData={projectRevision}
            formContext={{ projectRevision, query }}
            widgets={{
              RevisionStatusWidget,
              UpdatedFormsWidget,
              // This widget is responsible to update the `change_reason` field on the `project_revision` table
              // Name of this widget on the UI is `General Comments`
              ChangeReasonWidget,
              SelectWithNotifyWidget,
            }}
          ></FormBase>
          <RevisionRecordHistory projectRevision={projectRevision} />
          <div className="discard-revision-button">
            {showDiscardConfirmation && (
              <DangerAlert
                onProceed={discardRevision}
                onCancel={() => setShowDiscardConfirmation(false)}
                alertText="All changes made will be permanently deleted."
              />
            )}
            {!showDiscardConfirmation && (
              <Button
                id="discard-project-button"
                size="small"
                variant="secondary"
                onClick={() => setShowDiscardConfirmation(true)}
                disabled={discardingProjectRevision}
              >
                <FontAwesomeIcon icon={faTrash} id="discard-project-icon" />
                Discard Project Revision
              </Button>
            )}
          </div>
        </div>
      </DefaultLayout>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
        }
        .discard-revision-button {
          margin-top: 1rem;
          margin-bottom: 1rem;
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
