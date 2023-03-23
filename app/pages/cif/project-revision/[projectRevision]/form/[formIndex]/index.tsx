/* eslint-disable relay/must-colocate-fragment-spreads*/
import { Button } from "@button-inc/bcgov-theme";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { TaskListMode } from "components/TaskList/types";
import { useFormPages } from "data/formPages/formStructure";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import useRedirectToValidFormIndex from "hooks/useRedirectToValidFormIndex";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import { useRouter } from "next/router";
import {
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
} from "routes/pageRoutes";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";

const pageQuery = graphql`
  query FormIndexPageQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        changeStatus
        projectId
        projectByProjectId {
          pendingProjectRevision {
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
    }
  }
`;

export function ProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, FormIndexPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

  let mode: TaskListMode;
  if (!query.projectRevision?.projectId) mode = "create";
  else if (query.projectRevision.changeStatus === "committed") mode = "view";
  else mode = "update";

  const formIndex = Number(router.query.formIndex);

  const existingRevision =
    query.projectRevision?.projectByProjectId?.pendingProjectRevision;

  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    mode === "view"
  );

  const isRedirectingNoFundingStream = useRedirectTo404IfFalsy(
    query.projectRevision?.projectFormChange?.asProject
      ?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId
      ?.name
  );

  const fundingStream = isRedirectingNoFundingStream
    ? "err"
    : query.projectRevision.projectFormChange.asProject
        .fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId
        .name;
  const formPages = useFormPages(fundingStream);

  const isRedirectingToValidFormIndex = useRedirectToValidFormIndex(
    formIndex,
    formPages.length
  );

  if (
    isRedirecting ||
    isRedirectingNoFundingStream ||
    isRedirectingToLatestRevision ||
    isRedirectingToValidFormIndex
  )
    return null;

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: query.projectRevision.projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProjectRevision.projectRevision.id,
            router.query.formIndex as string
          )
        );
      },
    });
  };
  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionFormPageRoute(
        query.projectRevision.projectByProjectId.pendingProjectRevision.id,
        router.query.formIndex as string
      )
    );
  };

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

  const handleSubmit = () => {
    if (mode === "update" || formIndex === formPages.length - 1) {
      router.push(getProjectRevisionPageRoute(query.projectRevision.id));
    } else {
      router.push(
        getProjectRevisionFormPageRoute(query.projectRevision.id, formIndex + 1)
      );
    }
  };

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
