import FormBase from "components/Form/FormBase";
import DefaultLayout from "components/Layout/DefaultLayout";
import ChangeReasonWidget from "components/ProjectRevision/ChangeReasonWidget";
import NotifyModal from "components/ProjectRevision/NotifyModal";
import RevisionRecordHistory from "components/ProjectRevision/RevisionRecordHistory";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import UpdatedFormsWidget from "components/ProjectRevision/UpdatedFormsWidget";
import TaskList from "components/TaskList";
import { projectRevisionUISchema } from "data/jsonSchemaForm/projectRevisionSchema";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";
import { useState } from "react";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { editProjectRevisionQuery } from "__generated__/editProjectRevisionQuery.graphql";
import {
  buildProjectRevisionSchema,
  createProjectRevisionUISchema,
} from "./view";

export const EditProjectRevisionQuery = graphql`
  query editProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      ...NotifyModal_projectRevision
      id
      revisionType
      # eslint-disable-next-line relay/unused-fields
      typeRowNumber
      # eslint-disable-next-line relay/unused-fields
      changeReason
      ...RevisionStatusWidget_projectRevision
      ...SelectWithNotifyWidget_projectRevision
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...CollapsibleFormWidget_projectRevision
      ...UpdatedFormsWidget_projectRevision
      ...ChangeReasonWidget_projectRevision
      ...RevisionRecordHistory_projectRevision
      ...TaskList_projectRevision
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

export function ProjectRevisionEdit({
  preloadedQuery,
}: RelayProps<{}, editProjectRevisionQuery>) {
  const query = usePreloadedQuery(EditProjectRevisionQuery, preloadedQuery);
  const { session, projectRevision, allRevisionTypes, allRevisionStatuses } =
    query;

  const [formData, setFormData] = useState(projectRevision);
  const onChange = (e) => {
    setFormData(e.formData);
  };

  const taskList = (
    <TaskList projectRevision={projectRevision} mode={"update"} />
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
            className="project-revision-edit-form"
            schema={buildProjectRevisionSchema(
              allRevisionTypes.edges,
              filteredRevisionStatuses,
              projectRevision.revisionType
            )}
            uiSchema={createProjectRevisionUISchema(projectRevisionUISchema)}
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
  ProjectRevisionEdit,
  EditProjectRevisionQuery,
  withRelayOptions
);
