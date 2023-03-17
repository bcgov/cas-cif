import Form from "components/Form/Form";
import ExternalLayout from "components/Layout/ExternalLayout";
import ExternalTaskList from "components/TaskList/ExternalTaskList";
import { TaskListMode } from "components/TaskList/types";
import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexExternalPageQuery } from "__generated__/FormIndexExternalPageQuery.graphql";

const pageQuery = graphql`
  query FormIndexExternalPageQuery($projectRevision: ID!) {
    query {
      session {
        ...ExternalLayout_session
      }
      projectRevision(id: $projectRevision) {
        changeStatus
        projectId
      }
      ...Form_query
    }
  }
`;

export function ProjectFormPage({
  preloadedQuery,
}: RelayProps<{}, FormIndexExternalPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  let mode: TaskListMode;
  if (!query.projectRevision?.projectId) mode = "create";
  else if (query.projectRevision.changeStatus === "committed") mode = "view";
  else mode = "update";

  const taskList = <ExternalTaskList />;

  return (
    <ExternalLayout session={query.session} leftSideNav={taskList}>
      <Form query={query} mode={mode} isInternal={false} />
    </ExternalLayout>
  );
}

export default withRelay(ProjectFormPage, pageQuery, withRelayOptions);
