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
import Form from "components/Form/Form";

const pageQuery = graphql`
  query FormIndexPageQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        changeStatus
        projectId
        ...TaskList_projectRevision
      }
      ...Form_query
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

  const taskList = (
    <TaskList projectRevision={query.projectRevision} mode={mode} />
  );

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <Form query={query} mode={mode} isInternal />
    </DefaultLayout>
  );
}

export default withRelay(ProjectFormPage, pageQuery, withRelayOptions);
