import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { withRelay, RelayProps } from "relay-nextjs";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { createProjectRevisionQuery } from "__generated__/createProjectRevisionQuery.graphql";
import FormBase from "components/Form/FormBase";
import {
  createProjectRevisionSchema,
  projectRevisionUISchema,
} from "data/jsonSchemaForm/projectRevisionSchema";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import ContextualHelp from "lib/theme/widgets/ContextualHelp";

const pageQuery = graphql`
  query createProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      project: projectByProjectId {
        rowId
        pendingGeneralRevision {
          id
        }
        pendingAmendment {
          id
        }
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
  const existingGeneralRevision =
    projectRevision?.project?.pendingGeneralRevision?.id;
  const existingAmendment = projectRevision?.project?.pendingAmendment?.id;
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
  const localSchema = JSON.parse(JSON.stringify(createProjectRevisionSchema));

  const disabledEnums = existingAmendment
    ? ["Amendment"]
    : existingGeneralRevision
    ? ["General Revision"]
    : [];

  localSchema.properties.revisionType.anyOf = allRevisionTypes.edges.map(
    (e) => {
      const tooltipText = `<div><ul><li>You cannot create a new ${
        e.node.type
      } before the in-progress ${e.node.type} is ${
        e.node.type === "Amendment" ? "approved" : "applied"
      }.</li></ul></div>`;
      return {
        title: (
          <>
            {e.node.type}
            {disabledEnums.includes(e.node.type) && (
              <ContextualHelp
                text={tooltipText}
                label={e.node.type}
                placement="right"
              />
            )}
          </>
        ),
        const: e.node.type,
      };
    }
  );

  const amendmentTypeEnum = allAmendmentTypes.edges.map((e) => e.node.name);

  localSchema.dependencies.revisionType.oneOf[1].properties.amendmentTypes.items.enum =
    amendmentTypeEnum;

  const modifiedUiSchema = {
    ...projectRevisionUISchema,
    revisionType: {
      ...projectRevisionUISchema.revisionType,
      "ui:enumDisabled": disabledEnums,
    },
  };

  return (
    <>
      <DefaultLayout session={session} leftSideNav={taskList}>
        <div>
          {existingGeneralRevision && existingAmendment ? (
            <h1>There is an existing amendment and general revision</h1>
          ) : (
            <FormBase
              id="ProjectRevisionCreateForm"
              schema={localSchema as JSONSchema7}
              uiSchema={modifiedUiSchema}
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
          )}
        </div>
      </DefaultLayout>
    </>
  );
}

export default withRelay(ProjectRevisionCreate, pageQuery, withRelayOptions);
