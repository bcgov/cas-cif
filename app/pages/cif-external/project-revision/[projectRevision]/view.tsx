import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { viewExternalProjectRevisionQuery } from "__generated__/viewExternalProjectRevisionQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ExternalTaskList from "components/TaskList/ExternalTaskList";

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
export function ProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, viewExternalProjectRevisionQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    ExternalCifProjectViewQuery,
    preloadedQuery
  );
  const taskList = <ExternalTaskList projectRevision={projectRevision} />;
  return (
    <ExternalLayout session={session} leftSideNav={taskList}>
      <div className="container">
        <ProjectFormSummary projectRevision={projectRevision} />
      </div>
    </ExternalLayout>
  );
}

export default withRelay(
  ProjectFormPage,
  ExternalCifProjectViewQuery,
  withRelayOptions
);
