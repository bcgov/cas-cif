import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { withRelay, RelayProps } from "relay-nextjs";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { projectRevisionCreateNewQuery } from "__generated__/projectRevisionCreateNewQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  projectRevisionCreateSchema,
  projectRevisionCreateUISchema,
} from "data/jsonSchemaForm/projectRevisionCreateSchema";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";

const pageQuery = graphql`
  query projectRevisionCreateNewQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      project: projectByProjectId {
        rowId
        pendingProjectRevision {
          id
        }
      }
      ...TaskList_projectRevision
    }
  }
`;

export function ProjectRevisionCreate({
  preloadedQuery,
}: RelayProps<{}, projectRevisionCreateNewQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );
  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  const router = useRouter();
  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: projectRevision.project.rowId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProjectRevision.projectRevision.id,
            0
          )
        );
      },
    });
  };
  return (
    <DefaultLayout session={session} leftSideNav={taskList}>
      <div>
        <header></header>
        <h3>Select Revision Type</h3>
        <FormBase
          id="ProjectRevisionCreateForm"
          schema={projectRevisionCreateSchema as JSONSchema7}
          uiSchema={projectRevisionCreateUISchema}
        ></FormBase>
      </div>
      <br></br>
      <Button
        type="submit"
        size="small"
        disabled={
          isCreatingProjectRevision ||
          projectRevision.project.pendingProjectRevision !== null
        }
        onClick={handleCreateRevision}
      >
        New Revision
      </Button>

      <style jsx>{`
        div :global(.radio-button) {
          margin-top: 1rem;
          margin-left: 1rem;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevisionCreate, pageQuery, withRelayOptions);
