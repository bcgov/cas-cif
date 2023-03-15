import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { viewExternalProjectRevisionQuery } from "__generated__/viewExternalProjectRevisionQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ExternalTaskList from "components/TaskList/ExternalTaskList";
import { Button } from "@button-inc/bcgov-theme";

const ExternalCifProjectViewQuery = graphql`
  query viewExternalProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...ExternalLayout_session
    }
    projectRevision(id: $projectRevision) {
      ...ProjectFormSummary_projectRevision
    }
  }
`;
export function ExternalProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, viewExternalProjectRevisionQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    ExternalCifProjectViewQuery,
    preloadedQuery
  );
  const taskList = <ExternalTaskList />;
  return (
    <ExternalLayout session={session} leftSideNav={taskList}>
      <div className="container">
        <ProjectFormSummary projectRevision={projectRevision} viewOnly={true} />
        <Button
          size="small"
          onClick={() => {
            console.log("to be implemented 🍰");
          }}
        >
          Next
        </Button>
      </div>
    </ExternalLayout>
  );
}

export default withRelay(
  ExternalProjectFormPage,
  ExternalCifProjectViewQuery,
  withRelayOptions
);
