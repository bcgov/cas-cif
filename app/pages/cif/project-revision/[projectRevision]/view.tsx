import FormBase from "components/Form/FormBase";
import DefaultLayout from "components/Layout/DefaultLayout";
import ChangeReasonWidget from "components/ProjectRevision/ChangeReasonWidget";
import RevisionRecordHistory from "components/ProjectRevision/RevisionRecordHistory";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import UpdatedFormsWidget from "components/ProjectRevision/UpdatedFormsWidget";
import TaskList from "components/TaskList";
import {
  projectRevisionUISchema,
  viewProjectRevisionSchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import {
  viewProjectRevisionQuery,
  viewProjectRevisionQuery$data,
} from "__generated__/viewProjectRevisionQuery.graphql";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";

export const ViewProjectRevisionQuery = graphql`
  query viewProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      id
      revisionType
      revisionStatus
      typeRowNumber
      # eslint-disable-next-line relay/unused-fields
      changeReason
      projectByProjectId {
        latestCommittedProjectRevision {
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
  allRevisionStatusesEdges: viewProjectRevisionQuery$data["allRevisionStatuses"]["edges"],
  revisionType: string
): JSONSchema7 => {
  const schema = viewProjectRevisionSchema;
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

export function ProjectRevisionView({
  preloadedQuery,
}: RelayProps<{}, viewProjectRevisionQuery>) {
  const query = usePreloadedQuery(ViewProjectRevisionQuery, preloadedQuery);
  const { session, projectRevision, allRevisionStatuses } = query;

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

  const { fields } = utils.getDefaultRegistry();
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };
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
            className="project-revision-view-form"
            schema={buildProjectRevisionSchema(
              allRevisionStatuses.edges,
              projectRevision.revisionType
            )}
            fields={customFields}
            formContext={{ projectRevision, query }}
            formData={projectRevision}
            id={`form-${projectRevision.id}`}
            uiSchema={projectRevisionUISchema}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
            theme={readOnlyTheme}
            tagName={"dl"}
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
        </div>
      </DefaultLayout>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
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
