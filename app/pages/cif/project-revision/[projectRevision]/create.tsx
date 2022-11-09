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
import { useState } from "react";
import { useCreateProjectRevisionAmendment } from "mutations/projectRevisionAmendmentType/createProjectRevisionAmendmentType";

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
  const [createRevisionAmendment, isCreatingRevisionAmendment] =
    useCreateProjectRevisionAmendment();
  const [amendmentType, setAmendmentType] = useState(undefined);

  const handleCreateRevision = ({ formData }) => {
    createProjectRevision({
      variables: {
        projectId: projectRevision.project.rowId,
        revisionType: formData.revisionType,
      },
      onCompleted: (response) => {
        for (const ammendmentType of formData.amendmentType) {
          createRevisionAmendment({
            variables: {
              projectRevisionAmendmentType: {
                projectRevisionId:
                  response.createProjectRevision.projectRevision.rowId,
                amendmentType: ammendmentType,
              },
            },
          });
        }
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
  localSchema.properties.revisionType.enum = revisionEnum;

  if (amendmentType === "General Revision") {
    localSchema.properties.amendmentType =
      projectRevisionSchema.properties.amendmentType;
    localSchema.properties.amendmentType.items.enum = amendmentTypeEnum;
    localSchema.properties.revisionType.default = "General Revision";
    localSchema.required.push("amendmentType");
  } else {
    localSchema.properties.revisionType.default = amendmentType;
    localSchema.properties.amendmentType = {};
  }

  const handleOnchange = (e) => {
    if (e.formData.revisionType === "General Revision") {
      setAmendmentType("General Revision");
    } else {
      setAmendmentType(e.formData.revisionType);
    }
  };

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
            onChange={handleOnchange}
          >
            <Button
              type="submit"
              size="small"
              disabled={
                isCreatingProjectRevision || isCreatingRevisionAmendment
              }
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
