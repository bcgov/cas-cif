import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { withRelay, RelayProps } from "relay-nextjs";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { createQuery } from "__generated__/createQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  projectRevisionCreateSchema,
  projectRevisionCreateUISchema,
} from "data/jsonSchemaForm/projectRevisionCreateSchema";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";

const pageQuery = graphql`
  query createQuery($projectRevision: ID!) {
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
}: RelayProps<{}, createQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );
  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  const router = useRouter();
  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const handleCreateRevision = ({ formData }) => {
    console.log(formData.revisionType);
    createProjectRevision({
      variables: {
        projectId: projectRevision.project.rowId,
        revisionType: formData.revisionType,
      },
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
    <>
      <DefaultLayout session={session} leftSideNav={taskList}>
        <div>
          <FormBase
            id="ProjectRevisionCreateForm"
            schema={projectRevisionCreateSchema as JSONSchema7}
            uiSchema={projectRevisionCreateUISchema}
            onSubmit={handleCreateRevision}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
          >
            <Button
              type="submit"
              size="small"
              disabled={
                isCreatingProjectRevision ||
                projectRevision?.project.pendingProjectRevision !== null
              }
            >
              New Revision
            </Button>
          </FormBase>
        </div>
      </DefaultLayout>
      <style jsx>{`
        div :global(.radio) {
          padding: 5px;
        }
        div :global(.radio):first-child {
          margin-top: 25px;
        }
        div :global(input[type="radio"]) {
          margin-right: 10px;
        }
        div :global() {
          border: none;
        }
      `}</style>
    </>
  );
}

export default withRelay(ProjectRevisionCreate, pageQuery, withRelayOptions);
