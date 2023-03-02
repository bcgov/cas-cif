import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ExternalTaskList from "components/TaskList/ExternalTaskList";

const pageQuery = graphql`
  query viewExternalProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...ExternalLayout_session
      }
      projectRevision(id: $projectRevision) {
        ...ExternalTaskList_projectRevision
        ...ProjectFormSummary_projectRevision
      }
    }
  }
`;

export function ProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, FormIndexPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const taskList = (
    <ExternalTaskList projectRevision={query.projectRevision} mode={"view"} />
  );

  return (
    <ExternalLayout session={query.session} leftSideNav={taskList}>
      <div className="container">
        <ProjectFormSummary projectRevision={query.projectRevision} />
      </div>
    </ExternalLayout>
  );
}

export default withRelay(ProjectFormPage, pageQuery, withRelayOptions);
