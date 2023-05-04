import withRelayOptions from "lib/relay/withRelayOptions";
import { RelayProps, withRelay } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import {
  viewProjectRevisionQuery,
  viewProjectRevisionQuery$data,
} from "__generated__/viewProjectRevisionQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  viewProjectRevisionSchema,
  projectRevisionUISchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { getLocaleFormattedDate } from "lib/theme/getLocaleFormattedDate";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import NotifyModal from "components/ProjectRevision/NotifyModal";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import { useState } from "react";
import UpdatedFormsWidget from "components/ProjectRevision/UpdatedFormsWidget";
import ChangeReasonWidget from "components/ProjectRevision/ChangeReasonWidget";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";

import DangerAlert from "lib/theme/ConfirmationAlert";
import { Button } from "@button-inc/bcgov-theme";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "routes/pageRoutes";

const createProjectRevisionViewSchema = (
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
      id
      rowId
      revisionType
      createdAt
      revisionStatus
      # eslint-disable-next-line relay/unused-fields
      pendingActionsFrom
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
    }
    allRevisionTypes {
      edges {
        node {
          type
        }
      }
    }
    allRevisionStatuses(orderBy: SORTING_ORDER_ASC) {
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

export function ProjectRevisionView({
  preloadedQuery,
}: RelayProps<{}, viewProjectRevisionQuery>) {
  const router = useRouter();
  const query = usePreloadedQuery(ViewProjectRevisionQuery, preloadedQuery);
  const { session, projectRevision, allRevisionTypes, allRevisionStatuses } =
    query;

  const [formData, setFormData] = useState(projectRevision);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);

  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const onChange = (e) => {
    setFormData(e.formData);
  };

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
  const filteredRevisionStatuses = allRevisionStatuses.edges.filter(
    ({ node }) =>
      projectRevision.revisionType === "Amendment"
        ? node.name !== "Draft"
        : !node.isAmendmentSpecific
  );

  // TODO create reusable discard revision component
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
            schema={createProjectRevisionViewSchema(
              allRevisionTypes.edges,
              filteredRevisionStatuses,
              projectRevision.revisionType
            )}
            uiSchema={createProjectRevisionUISchema()}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
            theme={readOnlyTheme}
            onChange={onChange}
            formData={formData}
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
