import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";

import { getProjectsPageRoute } from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
// import ProjectContactForm from "components/Form/ProjectContactForm";
import { withTheme } from "@rjsf/core";
import FormBase from "components/Form/FormBase";

import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import projectSchema from "data/jsonSchemaForm/projectSchema";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        projectFormChange {
          newFormData
        }
        projectContactFormChanges {
          edges {
            node {
              newFormData
            }
          }
        }
        projectManagerFormChangesByLabel {
          edges {
            node {
              formChange {
                newFormData
              }
              projectManagerLabel {
                label
              }
            }
          }
        }
        ...TaskList_projectRevision
      }
      allContacts {
        edges {
          node {
            rowId
            id
            familyName
            givenName
          }
        }
      }
      allCifUsers {
        edges {
          node {
            rowId
            id
            familyName
            givenName
          }
        }
      }
      allFundingStreams {
        edges {
          node {
            id
            name
            rowId
          }
        }
      }
      allOperators {
        edges {
          node {
            rowId
            legalName
          }
        }
      }
      allProjectStatuses {
        edges {
          node {
            name
            rowId
          }
        }
      }
    }
  }
`;

// const contactsQuery = graphql`
//   query contactsFormQuery($projectRevision: ID!) {
//     query {
//       session {
//         ...DefaultLayout_session
//       }
//       projectRevision(id: $projectRevision) {
//         id
//         ...ProjectContactForm_projectRevision
//         ...TaskList_projectRevision
//       }
//       ...ProjectContactForm_query
//     }
//   }
// `;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const [updateProjectRevision, updatingProjectRevision] =
    useMutationWithErrorMessage(
      updateProjectRevisionMutation,
      () => "An error occurred while attempting to update the project revision."
    );
  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  /**
   *  Function: approve staged change, trigger an insert on the project
   *  table & redirect to the project page
   */
  const commitProject = async () => {
    updateProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
          projectRevisionPatch: { changeStatus: "committed" },
        },
      },
      // No need for an optimistic response
      // Since we navigate away from the page after the mutation is complete
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      updater: (store) => {
        // Invalidate the entire store,to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  const discardRevision = async () => {
    await discardProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
        },
      },
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  const newProjectFormData =
    query.projectRevision.projectFormChange.newFormData;

  const newContactFormData =
    query.projectRevision.projectContactFormChanges.edges;

  const newProjectManagerFormData =
    query.projectRevision.projectManagerFormChangesByLabel.edges;

  const contactIds = newContactFormData.map((el) => {
    return el.node.newFormData.contactId;
  });

  const managerIds = newProjectManagerFormData
    .map((el) => {
      if (el.node.formChange) {
        return el.node.formChange.newFormData.cifUserId;
      }
    })
    .filter((x) => x);

  const makeJSX = (ids, all) => {
    const result = all
      .map((el) => {
        if (ids.includes(el.node.rowId)) {
          return (
            <p>
              {el.node.givenName} {el.node.familyName}
            </p>
          );
        }
      })
      .filter((x) => x);
    return result;
  };

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  // const theme = {
  //   widgets: {
  //     input: () => <input type="text" className={"something"} required></input>,
  //   },
  //   // fields: {
  //   //   input: () => <input type="text" className={"something"} required></input>,
  //   // },
  // };

  // const uiSchema = {
  //   "ui:widget": "input",
  // };

  // const ThemedForm = withTheme(theme);

  // const schema = {
  //   title: "Test form",
  //   type: "string",
  // };

  // const schema = {
  //   type: "object",
  //   properties: {
  //     input: {
  //       type: "boolean",
  //     },
  //   },
  // };

  // const uiSchema = {
  //   done: {
  //     "ui:widget": "radio", // could also be "select"
  //   },
  // };
  //@ts-ignore
  // const Demo = () => <ThemedForm schema={schema} uiSchema={uiSchema} />;

  const uiSchema = {
    "ui:order": [
      "operatorTradeName",
      "projectName",
      "fundingStreamRfpId",
      "projectStatus",
      "summary",
      "projectStatusId",
      "proposalReference",
      "totalFundingRequest",
      "operatorId",
    ],
    proposalReference: {
      "ui:widget": "ReadOnlyWidget",
      "bcgov:size": "small",
      "ui:options": {
        text: `${newProjectFormData.proposalReference}`,
        title: "RFP Year",
      },
    },
    projectName: {
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "ReadOnlyWidget",
      "ui:options": {
        text: `${newProjectFormData.projectName}`,
        title: "Project Name",
      },
    },
    totalFundingRequest: {
      "ui:widget": "ReadOnlyWidget",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    summary: {
      "ui:col-md": 12,
      "ui:widget": "ReadOnlyWidget",
      "bcgov:size": "small",
      "ui:options": {
        text: `${newProjectFormData.summary}`,
        title: "Project Summary",
      },
    },
    operatorId: {
      "ui:placeholder": "Select an Operator",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "ReadOnlyWidget",
    },
    operatorTradeName: {
      "ui:col-md": 12,
      "ui:widget": "ReadOnlyWidget",
      "bcgov:size": "small",
      "ui:options": {
        text: `${
          query.allOperators.edges.find(
            (el) => el.node.rowId === newProjectFormData.operatorId
          ).node.legalName
        }`,
        title: "Operator",
      },
    },
    fundingStreamRfpId: {
      "ui:widget": "ReadOnlyWidget",
      "ui:col-md": 12,
      "ui:options": {
        text: `${
          query.allFundingStreams.edges.find(
            (el) => el.node.rowId === newProjectFormData.fundingStreamRfpId
          ).node.name
        }`,
        title: "Funding Stream",
      },
    },
    projectStatusId: {
      "ui:widget": "ReadOnlyWidget",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:options": {
        text: `${
          query.allProjectStatuses.edges.find(
            (el) => el.node.rowId === newProjectFormData.projectStatusId
          ).node.name
        }`,
        title: "Project Status",
      },
    },
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <div>
        <header>
          <h2>Review and Submit Project</h2>
        </header>

        {/* <Demo /> */}
        <FormBase
          // {...props}
          theme={readOnlyTheme}
          schema={projectSchema}
          uiSchema={uiSchema}
          // validate={uniqueProposalReferenceValidation}
          formData={query.projectRevision.projectFormChange.newFormData}
          formContext={{
            query,
            form: query.projectRevision.projectFormChange.newFormData,
            // operatorCode: selectedOperator?.node?.operatorCode,
          }}
          // widgets={{
          //   SelectRfpWidget: SelectRfpWidget,
          //   SelectProjectStatusWidget: SelectProjectStatusWidget,
          // }}
          // onChange={(change) => handleChange(change.formData, "pending")}
          // onSubmit={handleSubmit}
        ></FormBase>

        <p>
          {
            query.allFundingStreams.edges.find(
              (el) => el.node.rowId === newProjectFormData.fundingStreamRfpId
            ).node.name
          }
        </p>
        <p>
          {
            query.allOperators.edges.find(
              (el) => el.node.rowId === newProjectFormData.operatorId
            ).node.legalName
          }
        </p>
        <p>{newProjectFormData.projectName}</p>
        <p>
          {
            query.allProjectStatuses.edges.find(
              (el) => el.node.rowId === newProjectFormData.projectStatusId
            ).node.name
          }
        </p>
        <p>{newProjectFormData.proposalReference}</p>
        <p>{newProjectFormData.summary}</p>
        <p>${newProjectFormData.totalFundingRequest}</p>

        <h2>Project Contacts</h2>
        {makeJSX(contactIds, query.allContacts.edges)}
        {/* <ProjectContactForm /> */}

        {/* just export the theme, not the with theme as a component */}

        <h2>Project Managers</h2>
        {makeJSX(managerIds, query.allCifUsers.edges)}

        {/* brianna--is this a good approach and how should it differ from ProjectContact/ProjectForm? */}
        {/* brianna--is the query I'm doing above correct approach vs fragments like the others */}
        {/* brianna--how to get the pending project details */}
        {/* <SummaryForm query={query} /> */}

        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={updatingProjectRevision || discardingProjectRevision}
        >
          Submit
        </Button>
        <Button
          size="medium"
          variant="secondary"
          onClick={discardRevision}
          disabled={updatingProjectRevision || discardingProjectRevision}
        >
          Discard Changes
        </Button>
      </div>
      <style jsx>{`
        div :global(.pg-button) {
          margin-right: 3em;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
