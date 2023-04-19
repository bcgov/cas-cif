/* eslint-disable relay/must-colocate-fragment-spreads*/
import ExternalTaskList from "components/TaskList/ExternalTaskList";
import { TaskListMode } from "components/TaskList/types";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { useFormIndexHelpers } from "../../../../../../hooks/useFormIndexHelpers";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexExternalPageQuery } from "__generated__/FormIndexExternalPageQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";

const pageQuery = graphql`
  query FormIndexExternalPageQuery($projectRevision: ID!) {
    query {
      session {
        ...ExternalLayout_session
      }
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
        ...ApplicationOverviewForm_projectRevision
        ...ExternalTaskList_projectRevision
      }
    }
  }
`;

export function ExternalProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, FormIndexExternalPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  let mode: TaskListMode;
  if (!query.projectRevision?.projectId) mode = "create";
  else if (query.projectRevision.changeStatus === "committed") mode = "view";
  else mode = "update";
  const router = useRouter();
  const formIndex = Number(router.query.formIndex);

  const {
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
    false
  );

  if (
    isRedirecting ||
    isRedirectingNoFundingStream ||
    isRedirectingToLatestRevision ||
    isRedirectingToValidFormIndex
  )
    return null;

  const taskList = <ExternalTaskList projectRevision={query.projectRevision} />;

  const EditComponent = formPages[formIndex].editComponent;
  const ViewComponent = formPages[formIndex].viewComponent;
  return (
    <ExternalLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" && ViewComponent ? (
        <>
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
    </ExternalLayout>
  );
}

export default withRelay(ExternalProjectFormPage, pageQuery, withRelayOptions);
