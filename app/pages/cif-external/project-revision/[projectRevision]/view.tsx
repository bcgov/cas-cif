import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { viewExternalProjectRevisionQuery } from "__generated__/viewExternalProjectRevisionQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";
import ExternalTaskList from "components/TaskList/ExternalTaskList";
import { Button } from "@button-inc/bcgov-theme";
import { useRouter } from "next/router";
import ExternalProjectFormSummary from "components/Form/ExternalProjectFormSummary";
import { getExternalProjectRevisionPageRoute } from "routes/pageRoutes";

const ExternalCifProjectViewQuery = graphql`
  query viewExternalProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...ExternalLayout_session
    }
    projectRevision(id: $projectRevision) {
      id
      ...ExternalProjectFormSummary_projectRevision
      ...ExternalTaskList_projectRevision
    }
  }
`;
export function ExternalProjectRevisionView({
  preloadedQuery,
}: RelayProps<{}, viewExternalProjectRevisionQuery>) {
  const router = useRouter();
  const { session, projectRevision } = usePreloadedQuery(
    ExternalCifProjectViewQuery,
    preloadedQuery
  );
  const taskList = <ExternalTaskList projectRevision={projectRevision} />;
  let renderList = false;
  if (
    router.pathname === "/cif-external/project-revision/[projectRevision]/view"
  ) {
    renderList = true;
  }
  return (
    <ExternalLayout session={session} leftSideNav={taskList}>
      <div className="container">
        <h2>Application Overview</h2>
        <ExternalProjectFormSummary projectRevision={projectRevision} />
        {renderList && (
          <Button
            size="small"
            onClick={() => {
              router.push(
                getExternalProjectRevisionPageRoute(projectRevision.id)
              );
            }}
          >
            Next
          </Button>
        )}
      </div>
    </ExternalLayout>
  );
}

export default withRelay(
  ExternalProjectRevisionView,
  ExternalCifProjectViewQuery,
  withRelayOptions
);
