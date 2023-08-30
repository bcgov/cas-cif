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
  const existingRevisionType = existingAmendment
    ? "Amendment"
    : existingGeneralRevision
    ? "General Revision"
    : null;

  const disabledEnums = existingRevisionType ? [existingRevisionType] : [];
  // (
  //   <>
  //     {e.node.type}
  //     {disabledEnums.includes(e.node.type) && (
  //       <ContextualHelp
  //         text={tooltipText}
  //         label={e.node.type}
  //         placement="right"
  //       />
  //     )}
  //   </>
  // );

  const revisionAnyOf = allRevisionTypes.edges.map((e) => {
    return {
      type: "string",
      // title: (
      //   <>
      //     {e.node.type}
      //     {disabledEnums.includes(e.node.type) && (
      //       <ContextualHelp
      //         text={"tooltipText"}
      //         label={e.node.type}
      //         placement="right"
      //       />
      //     )}
      //   </>
      // ),
      title: "brai",
      enum: [e.node.type],
    };
  });

  const revisionEnum = allRevisionTypes.edges.map((e) => e.node.type);
  const revisionEnumNames = allRevisionTypes.edges.map((e) => {
    return (
      <>
        {e.node.type}
        {disabledEnums.includes(e.node.type) && (
          <ContextualHelp
            text={"tooltipText"}
            label={e.node.type}
            placement="right"
          />
        )}
      </>
    );
  });

  // console.log("createProjectRevisionSchema", createProjectRevisionSchema);
  // const amendmentTypeEnum = allAmendmentTypes.edges.map((e) => e.node.name);

  // const localSchema = JSON.parse(JSON.stringify(createProjectRevisionSchema));
  // localSchema.dependencies.revisionType.oneOf[1].properties.amendmentTypes.items.enum =
  //   amendmentTypeEnum;
  createProjectRevisionSchema.properties.revisionType.enum = revisionEnum;
  createProjectRevisionSchema.properties.revisionType.enumNames =
    revisionEnumNames;
  // console.log("createProjectRevisionSchema", createProjectRevisionSchema);

  // console.log("localSchema", localSchema);

  const schema = {
    properties: {
      field: {
        type: "number",
        anyOf: [
          {
            type: "number",
            title: <div>djd</div>,
            enum: [1],
          },
          {
            type: "number",
            title: "two",
            enum: [2],
          },
          {
            type: "number",
            title: "three",
            enum: [3],
          },
        ],
      },
    },
  };
  // localSchema.properties.revisionType.anyOf = allRevisionTypes.edges.map(
  //   (e) => {
  //     const tooltipText = `<div><ul><li>You cannot create a new ${
  //       e.node.type
  //     } before the in-progress ${e.node.type} is ${
  //       e.node.type === "Amendment" ? "approved" : "applied"
  //     }.</li></ul></div>`;
  //     return {
  //       title: (
  //         <>
  //           {e.node.type}
  //           {disabledEnums.includes(e.node.type) && (
  //             <ContextualHelp
  //               text={tooltipText}
  //               label={e.node.type}
  //               placement="right"
  //             />
  //           )}
  //         </>
  //       ),
  //       const: e.node.type,
  //     };
  //   }
  // );

  // createProjectRevisionSchema.properties.revisionType.anyOf = [
  //   {
  //     type: "string",
  //     enum: [1],
  //     title: <div>djd</div>,
  //   },
  //   {
  //     type: "string",
  //     title: "two",
  //     enum: [2],
  //   },
  //   {
  //     type: "string",
  //     title: "three",
  //     enum: [3],
  //   },
  // ];

  const modifiedUiSchema = {
    ...projectRevisionUISchema,
    // revisionType: {
    //   ...projectRevisionUISchema.revisionType,
    //   "ui:enumDisabled": disabledEnums,
    //   ...(existingRevisionType && {
    //     "ui:tooltip": {
    //       text: `<div><ul><li>You cannot create a new ${existingRevisionType} before the in-progress ${existingRevisionType} is ${
    //         existingRevisionType === "Amendment" ? "approved" : "applied"
    //       }.</li></ul></div>`,
    //     },
    // }),
    // },
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
              schema={createProjectRevisionSchema as JSONSchema7}
              uiSchema={{
                revisionType: {
                  "ui:widget": "radio",
                },
              }}
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
