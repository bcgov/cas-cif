/* eslint-disable relay/must-colocate-fragment-spreads*/
import { Button } from "@button-inc/bcgov-theme";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { TaskListMode } from "components/TaskList/types";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { useFormIndexHelpers } from "hooks/useFormIndexHelpers";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";

const pageQuery = graphql`
  query FormIndexPageQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      ...ProjectFundingAgreementFormSummary_query
      projectRevision(id: $projectRevision) {
        id
        changeStatus
        projectId
        projectByProjectId {
          pendingGeneralRevision {
            id
          }
          latestCommittedProjectRevision {
            id
          }
        }
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }
        ...TaskList_projectRevision
        ...ProjectForm_projectRevision
        ...ProjectFormSummary_projectRevision
        ...ProjectContactForm_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...ProjectManagerFormGroup_projectRevision
        ...ProjectManagerFormSummary_projectRevision
        ...ProjectQuarterlyReportForm_projectRevision
        ...ProjectQuarterlyReportFormSummary_projectRevision
        ...ProjectAnnualReportForm_projectRevision
        ...ProjectMilestoneReportForm_projectRevision
        ...ProjectMilestoneReportFormSummary_projectRevision
        ...ProjectAnnualReportFormSummary_projectRevision
        ...ProjectFundingAgreementForm_projectRevision
        ...ProjectFundingAgreementFormSummary_projectRevision
        ...ProjectEmissionIntensityReportForm_projectRevision
        ...ProjectEmissionIntensityReportFormSummary_projectRevision
        ...ProjectSummaryReportForm_projectRevision
        ...ProjectSummaryReportFormSummary_projectRevision
      }
      ...ProjectForm_query
      ...ProjectContactForm_query
      ...ProjectManagerFormGroup_query
      ...ProjectMilestoneReportForm_query
      ...ProjectFundingAgreementForm_query
      ...ProjectFundingAgreementFormSummary_query
    }
  }
`;

export function ProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, FormIndexPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  let mode: TaskListMode;
  if (!query.projectRevision?.projectId) mode = "create";
  else if (query.projectRevision.changeStatus === "committed") mode = "view";
  else mode = "update";

  const router = useRouter();
  const formIndex = Number(router.query.formIndex);

  const {
    handleCreateRevision,
    isCreatingProjectRevision,
    handleResumeRevision,
    handleSubmit,
    isRedirecting,
    isRedirectingToLatestRevision,
    isRedirectingNoFundingStream,
    formPages,
    isRedirectingToValidFormIndex,
  } = useFormIndexHelpers(
    query.projectRevision?.projectId,
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.pendingGeneralRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    query.projectRevision?.projectFormChange?.asProject
      ?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId
      ?.name,
    mode,
    formIndex,
    true
  );

  const existingRevision =
    query.projectRevision?.projectByProjectId?.pendingGeneralRevision;

  if (
    isRedirecting ||
    isRedirectingNoFundingStream ||
    isRedirectingToLatestRevision ||
    isRedirectingToValidFormIndex
  )
    return null;

  const createEditButton = () => {
    return (
      <div>
        <Button
          className="edit-button"
          onClick={
            existingRevision ? handleResumeRevision : handleCreateRevision
          }
          disabled={isCreatingProjectRevision}
        >
          {existingRevision ? "Resume Edition" : "Edit"}
        </Button>
        <style jsx>{`
          div :global(.edit-button) {
            float: right;
          }
        `}</style>
      </div>
    );
  };

  const taskList = (
    <TaskList projectRevision={query.projectRevision} mode={mode} />
  );

  const EditComponent = formPages[formIndex].editComponent;
  const ViewComponent = formPages[formIndex].viewComponent;
  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" && ViewComponent ? (
        <>
          {createEditButton()}
          <ViewComponent
            projectRevision={query.projectRevision}
            viewOnly={true}
            query={query}
          />
        </>
      ) : (
        <EditComponent
          query={query}
          projectRevision={query.projectRevision}
          onSubmit={handleSubmit}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectFormPage, pageQuery, withRelayOptions);
