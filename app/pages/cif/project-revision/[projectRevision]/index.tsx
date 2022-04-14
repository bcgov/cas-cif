import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import { createProjectUiSchema } from "components/Form/ProjectForm";
import { getProjectsPageRoute } from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import FormBase from "components/Form/FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { useMemo } from "react";
import { createProjectContactUiSchema } from "components/Form/ProjectContactForm";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import { createProjectManagerUiSchema } from "components/Form/ProjectManagerForm";
import { JSONSchema7 } from "json-schema";

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
        projectContactFormChanges(
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) {
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
            fullName
          }
        }
      }
      allCifUsers {
        edges {
          node {
            rowId
            id
            fullName
          }
        }
      }
      allFundingStreamRfps {
        edges {
          node {
            fundingStreamByFundingStreamId {
              name
              description
            }
            rowId
            year
          }
        }
      }
      allOperators {
        edges {
          node {
            rowId
            legalName
            tradeName
            bcRegistryId
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

  const selectedOperator = useMemo(() => {
    if (!query.projectRevision) {
      return null;
    }
    return query.allOperators.edges.find(
      ({ node }) =>
        node.rowId ===
        query.projectRevision.projectFormChange.newFormData.operatorId
    );
  }, [query]);

  const rfpStream = useMemo(() => {
    if (!query.projectRevision) {
      return null;
    }
    return query.allFundingStreamRfps.edges.find(
      ({ node }) =>
        node.rowId ===
        query.projectRevision.projectFormChange.newFormData.fundingStreamRfpId
    );
  }, [query]);

  const projectStatus = useMemo(() => {
    if (!query.projectRevision) {
      return null;
    }
    return query.allProjectStatuses.edges.find(
      ({ node }) =>
        node.rowId ===
        query.projectRevision.projectFormChange.newFormData.projectStatusId
    );
  }, [query]);

  const primaryContact = useMemo(() => {
    if (!query.projectRevision) return null;

    const primaryContactNode =
      query.projectRevision.projectContactFormChanges.edges.find(
        ({ node }) => node.newFormData.contactIndex === 1
      );
    if (!primaryContactNode) return null;
    return query.allContacts.edges.find(
      ({ node }) => node.rowId === primaryContactNode.node.newFormData.contactId
    );
  }, [query]);

  const secondaryContacts = useMemo(() => {
    if (!query.projectRevision) {
      return null;
    }
    const secondaryContactNodes =
      query.projectRevision.projectContactFormChanges.edges.filter(
        ({ node }) => node.newFormData.contactIndex !== 1
      );

    return secondaryContactNodes;
  }, [query]);

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

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const isOverviewEmpty =
    Object.keys(query.projectRevision.projectFormChange.newFormData).length ===
    0;

  const areManagersEmpty =
    query.projectRevision.projectManagerFormChangesByLabel.edges
      .map(({ node }) => node.formChange?.newFormData.cifUserId)
      .filter((manager) => manager).length === 0
      ? true
      : false;

  // need to check for the existence of contactId because users can add blank contacts
  const areContactsEmpty =
    query.projectRevision.projectContactFormChanges.edges
      .map(({ node }) => node.newFormData.contactId)
      .filter((contact) => contact).length === 0
      ? true
      : false;

  const areSecondaryContactsEmpty =
    secondaryContacts
      .map(({ node }) => node.newFormData.contactId)
      .filter((contact) => contact).length === 0
      ? true
      : false;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <div>
        <header>
          <h2>Review and Submit Project</h2>
        </header>
        <h3>Project Overview</h3>
        {isOverviewEmpty ? (
          <em>Project overview not added</em>
        ) : (
          <FormBase
            tagName={"dl"}
            theme={readOnlyTheme}
            schema={projectSchema as JSONSchema7}
            uiSchema={createProjectUiSchema(
              selectedOperator ? selectedOperator.node.tradeName : "",
              selectedOperator ? selectedOperator.node.legalName : "",
              selectedOperator ? selectedOperator.node.bcRegistryId : "",
              rfpStream
                ? `${rfpStream.node.fundingStreamByFundingStreamId.description} - ${rfpStream.node.year}`
                : "",
              projectStatus ? projectStatus.node.name : ""
            )}
            formData={query.projectRevision.projectFormChange.newFormData}
            formContext={{
              query,
              form: query.projectRevision.projectFormChange.newFormData,
            }}
          />
        )}

        <h3>Project Managers</h3>
        {areManagersEmpty ? (
          <em>Project managers not added</em>
        ) : (
          query.projectRevision.projectManagerFormChangesByLabel.edges.map(
            ({ node }) => {
              if (!node.formChange) return;
              const nodeManager = query.allCifUsers.edges.find(
                (manager) =>
                  manager.node.rowId === node.formChange?.newFormData.cifUserId
              );

              return (
                <FormBase
                  key={node.formChange.newFormData.projectManagerLabelId}
                  tagName={"dl"}
                  theme={readOnlyTheme}
                  schema={projectManagerSchema as JSONSchema7}
                  uiSchema={createProjectManagerUiSchema(
                    nodeManager ? nodeManager.node.fullName : "",
                    node.projectManagerLabel.label
                  )}
                  formData={
                    query.projectRevision.projectManagerFormChangesByLabel
                  }
                  formContext={{
                    query,
                    form: query.projectRevision.projectFormChange.newFormData,
                  }}
                />
              );
            }
          )
        )}

        <h3>Project Contacts</h3>
        {areContactsEmpty ? (
          <em>Project contacts not added</em>
        ) : (
          <>
            <label>Primary Contact</label>
            {!primaryContact ? (
              <dd>
                <em>Not added</em>
              </dd>
            ) : (
              <FormBase
                key={primaryContact?.node.id}
                tagName={"dl"}
                theme={readOnlyTheme}
                schema={projectContactSchema as JSONSchema7}
                uiSchema={createProjectContactUiSchema(
                  primaryContact ? primaryContact.node.fullName : ""
                )}
                formData={query.projectRevision.projectFormChange.newFormData}
                formContext={{
                  query,
                  form: query.projectRevision.projectContactFormChanges,
                }}
              />
            )}
            {<label>Secondary Contacts</label>}
            {areSecondaryContactsEmpty ? (
              <dd>
                <em>Not added</em>
              </dd>
            ) : (
              secondaryContacts.map(({ node }) => {
                const nodeContact = query.allContacts.edges.find(
                  (contact) => contact.node.rowId === node.newFormData.contactId
                );
                return (
                  <FormBase
                    key={node.newFormData.contactIndex}
                    tagName={"dl"}
                    theme={readOnlyTheme}
                    schema={projectContactSchema as JSONSchema7}
                    uiSchema={createProjectContactUiSchema(
                      nodeContact ? nodeContact.node.fullName : " "
                    )}
                    formData={
                      query.projectRevision.projectFormChange.newFormData
                    }
                    formContext={{
                      query,
                      form: query.projectRevision.projectContactFormChanges,
                    }}
                  />
                );
              })
            )}
          </>
        )}

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
        h3 {
          margin: 1em 0 0 0;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
