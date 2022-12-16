import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import DefaultLayout from "components/Layout/DefaultLayout";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { JSONSchema7 } from "json-schema";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useCreateProjectMutation } from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { graphql, usePreloadedQuery, useFragment } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { newProjectRevisionQuery } from "__generated__/newProjectRevisionQuery.graphql";

const schema: JSONSchema7 = {
  $schema: projectSchema.$schema,
  type: projectSchema.type,
  required: ["fundingStreamRfpId"],
  properties: {
    fundingStreamRfpId: {
      type: "number",
      title: "RFP Year ID",
    },
  },
};

const uiSchema = {
  fundingStreamRfpId: {
    "ui:widget": "SelectRfpWidget",
    "ui:options": {
      text: `text`,
      label: true,
    },
  },
};
// Forgetting to spread `newProjectForm_query` in `useFragment()`'s parent's fragment.--THERE ISN'T A PARENT FRAGMENT, JUST A PARENT QUERY?
export const pageQuery = graphql`
  query newProjectRevisionQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      #   ...newProjectForm_query
      ...SelectRfpWidget_query
    }
  }
`;

export function ProjectRevisionNew({
  preloadedQuery,
}: RelayProps<{}, newProjectRevisionQuery>) {
  const { session, query } = usePreloadedQuery(pageQuery, preloadedQuery);

  //   const query = useFragment(
  //     graphql`
  //       fragment newProjectForm_query on Query {
  //         ...SelectRfpWidget_query
  //       }
  //     `,
  //     pageQuery.query
  //   );

  console.log("query in new", query);

  const router = useRouter();

  //   const handleChange = (changeData: any) => {
  //     const updatedFormData = {
  //       ...projectRevision.projectFormChange.newFormData,
  //       ...changeData,
  //     };

  //     return new Promise((resolve, reject) =>
  //       updateNewProject({
  //         variables: {
  //           input: {
  //             rowId: projectRevision.projectFormChange.rowId,
  //             formChangePatch: {
  //               newFormData: updatedFormData,
  //             },
  //           },
  //         },
  //         optimisticResponse: {
  //           updateFormChange: {
  //             formChange: {
  //               id: projectRevision.projectFormChange.id,
  //               newFormData: updatedFormData,
  //               isUniqueValue: projectRevision.projectFormChange.isUniqueValue,
  //               changeStatus: "pending",
  //               projectRevisionByProjectRevisionId: undefined,
  //             },
  //           },
  //         },
  //         onCompleted: resolve,
  //         onError: reject,
  //         debounceKey: projectRevision.projectFormChange.id,
  //       })
  //     );
  //   };

  const [createProject, isCreatingProject] = useCreateProjectMutation();
  //   chek for errors--can't use handlestage, is rjsf regular validation enough?
  const handleSubmit = async () => {
    createProject({
      variables: { input: {} },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProject.projectRevision.id,
            0
          )
        );
      },
    });
    //redirect probably
  };

  const handleError = () => {
    // handleStage();
  };

  return (
    <>
      <DefaultLayout session={session}>
        <header>
          <h2>New Project</h2>
        </header>
        <FormBase
          tagName={"dl"}
          className="project-revision-view-form"
          schema={schema}
          uiSchema={uiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
          //   formData={projectRevision}
          formContext={{
            query,
          }}
          id="ProjectRevisionNewForm"
          //   onChange={(change) => handleChange(change.formData)}
          onSubmit={handleSubmit}
          onError={handleError}
          widgets={{
            SelectRfpWidget: SelectRfpWidget,
          }}
        >
          <Button type="submit" size="small">
            Confirm
          </Button>
          <em>These fields are immutable once selected</em>
        </FormBase>
      </DefaultLayout>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section) {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section > dd) {
          margin-bottom: 0;
        }
        div :global(.revision-record-history-section > dd > em) {
          font-weight: bold;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
}
export default withRelay(ProjectRevisionNew, pageQuery, withRelayOptions);
