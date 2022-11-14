import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { withRelay, RelayProps } from "relay-nextjs";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { createProjectRevisionQuery } from "__generated__/createProjectRevisionQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  projectRevisionSchema,
  projectRevisionUISchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import useShowGrowthbookFeature from "lib/growthbookWrapper";

const pageQuery = graphql`
  query createProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      project: projectByProjectId {
        rowId
      }
      ...TaskList_projectRevision
    }
    allRevisionTypes {
      edges {
        node {
          id
          type
        }
      }
    }
    allAmendmentTypes {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export function ProjectRevisionCreate({
  preloadedQuery,
}: RelayProps<{}, createProjectRevisionQuery>) {
  const { session, projectRevision, allRevisionTypes, allAmendmentTypes } =
    usePreloadedQuery(pageQuery, preloadedQuery);
  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  const router = useRouter();
  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const handleCreateRevision = ({ formData }) => {
    createProjectRevision({
      variables: {
        projectId: projectRevision.project.rowId,
        revisionType: formData.revisionType,
        amendmentTypes: formData.amendmentTypes,
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
  const revisionEnum = allRevisionTypes.edges.map((e) => e.node.type);
  projectRevisionSchema.properties.revisionType.enum = revisionEnum;

  // Growthbook - amendments
  if (!useShowGrowthbookFeature("amendments")) return null;
  const amendmentTypeEnum = allAmendmentTypes.edges.map((e) => e.node.name);

  const localSchema = JSON.parse(JSON.stringify(projectRevisionSchema));
  localSchema.dependencies.revisionType.oneOf[1].properties.amendmentTypes.items.enum =
    amendmentTypeEnum;

  return (
    <>
      <DefaultLayout session={session} leftSideNav={taskList}>
        <div>
          <FormBase
            id="ProjectRevisionCreateForm"
            schema={localSchema as JSONSchema7}
            uiSchema={projectRevisionUISchema}
            onSubmit={handleCreateRevision}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
          >
            <Button
              type="submit"
              size="small"
              disabled={isCreatingProjectRevision}
            >
              New Revision
            </Button>
          </FormBase>
        </div>
      </DefaultLayout>
    </>
  );
}

export default withRelay(ProjectRevisionCreate, pageQuery, withRelayOptions);
