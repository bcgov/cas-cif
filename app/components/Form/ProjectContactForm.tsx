import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactForm_query$key } from "__generated__/ProjectContactForm_query.graphql";
import FormBase from "./FormBase";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import {
  ProjectContactForm_projectRevision$key,
  FormChangeOperation,
} from "__generated__/ProjectContactForm_projectRevision.graphql";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import SavingIndicator from "./SavingIndicator";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import UndoChangesButton from "./UndoChangesButton";
import { useCreatePrimaryContact } from "mutations/ProjectContact/createPrimaryContact";

interface Props {
  query: ProjectContactForm_query$key;
  onSubmit: () => void;
  projectRevision: ProjectContactForm_projectRevision$key;
}
// You only need to include the optional arguments when using this function to create the schema for the summary (read-only) page.
export const createProjectContactUiSchema = (contact?) => {
  return {
    contactId: {
      "ui:placeholder": "Select a Contact",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "SearchWidget",
      "ui:options": {
        label: false,
        text: contact,
        title: "",
      },
    },
  };
};

export const createProjectContactSchema = (allContacts) => {
  const schema = projectContactSchema;
  schema.properties.contactId = {
    ...schema.properties.contactId,
    anyOf: allContacts.edges.map(({ node }) => {
      return {
        type: "number",
        title: node.fullName,
        enum: [node.rowId],
        value: node.rowId,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

const ProjectContactForm: React.FC<Props> = (props) => {
  const formRefs = useRef<Record<string, any>>({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectContactForm_projectRevision on ProjectRevision {
        id
        rowId
        changeStatus
        projectFormChange {
          formDataRecordId
        }
        projectContactFormChanges(
          first: 500
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_projectContactFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );
  const { projectContactFormChanges } = projectRevision;

  const { allContacts } = useFragment(
    graphql`
      fragment ProjectContactForm_query on Query {
        allContacts {
          edges {
            node {
              rowId
              fullName
            }
          }
        }
      }
    `,
    props.query
  );

  const contactSchema = useMemo(() => {
    return createProjectContactSchema(allContacts);
  }, [allContacts]);

  const uiSchema = createProjectContactUiSchema();

  const [addContactMutation, isAdding] = useAddContactToRevision();

  const addContact = (contactIndex: number) => {
    addContactMutation({
      variables: {
        input: {
          revisionId: projectRevision.rowId,
          contactIndex: contactIndex,
        },
        connections: [projectRevision.projectContactFormChanges.__id],
      },
    });
  };

  const allForms = useMemo(() => {
    const contactForms = [
      ...projectContactFormChanges.edges
        .filter(({ node }) => node.operation !== "ARCHIVE")
        .map(({ node }) => node),
    ];
    contactForms.sort(
      (a, b) => a.newFormData.contactIndex - b.newFormData.contactIndex
    );
    return contactForms;
  }, [projectContactFormChanges]);

  const [primaryContactForm, ...alternateContactForms] = allForms;
  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateProjectContactFormChange();
  const [discardFormChange] = useDiscardFormChange(
    projectContactFormChanges.__id
  );

  const deleteContact = (
    formChangeId: string,
    formChangeOperation: FormChangeOperation
  ) => {
    discardFormChange({
      formChange: { id: formChangeId, operation: formChangeOperation },
      onCompleted: () => {
        delete formRefs.current[formChangeId];
      },
    });
  };

  const updateFormChange = (
    formChange: {
      readonly id: string;
      readonly newFormData: any;
      readonly operation: FormChangeOperation;
      readonly changeStatus: string;
    },
    newFormData: any
  ) => {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData,
            changeStatus: formChange.changeStatus,
          },
        },
      },
      debounceKey: formChange.id,
    });
  };

  const clearPrimaryContact = () => {
    const { contactId, ...newFormData } = primaryContactForm.newFormData;
    updateFormChange(primaryContactForm, newFormData);
  };

  const [createPrimaryContact] = useCreatePrimaryContact();

  const handlePrimaryContactChange = (change) => {
    if (primaryContactForm) {
      updateFormChange(
        { ...primaryContactForm, changeStatus: "pending" },
        change.formData
      );
    } else {
      createPrimaryContact({
        variables: {
          connections: [projectRevision.projectContactFormChanges.__id],
          input: {
            projectRevisionId: projectRevision.rowId,
            operation: "CREATE",
            formDataSchemaName: "cif",
            formDataTableName: "project_contact",
            jsonSchemaName: "project_contact",
            newFormData: change.formData,
          },
        },
      });
    }
  };

  const stageContactFormChanges = async () => {
    const validationErrors = Object.keys(formRefs.current).reduce(
      (agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      },
      []
    );

    const completedPromises: Promise<void>[] = [];

    projectContactFormChanges.edges.forEach(({ node }) => {
      if (node.changeStatus === "pending") {
        const promise = new Promise<void>((resolve, reject) => {
          applyUpdateFormChangeMutation({
            variables: {
              input: {
                id: node.id,
                formChangePatch: {
                  changeStatus: "staged",
                },
              },
            },
            debounceKey: node.id,
            onCompleted: () => {
              resolve();
            },
            onError: reject,
          });
        });
        completedPromises.push(promise);
      }
    });
    try {
      await Promise.all(completedPromises);
      if (validationErrors.length === 0) props.onSubmit();
    } catch (e) {
      // the failing mutation will display an error message and send the error to sentry
    }
  };

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectContactFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectContactFormChanges]);

  return (
    <div>
      <header>
        <h2>Project Contacts</h2>
        <UndoChangesButton formChangeIds={formChangeIds} />
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <Grid.Row>
                <Grid.Col span={10} className="right-aligned-column">
                  <Button>View Contact List</Button>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row>
                <label htmlFor="primaryContactForm_contactId">
                  Primary Contact
                </label>
              </Grid.Row>
              <Grid.Row>
                <Grid.Col span={6}>
                  <FormBase
                    id="primaryContactForm"
                    idPrefix="primaryContactForm"
                    ref={(el) => (formRefs.current.primaryContact = el)}
                    formData={
                      primaryContactForm?.newFormData || {
                        contactId: null,
                        contactIndex: 1,
                        projectId:
                          projectRevision.projectFormChange.formDataRecordId,
                      }
                    }
                    onChange={handlePrimaryContactChange}
                    schema={contactSchema}
                    uiSchema={uiSchema}
                    ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  />
                </Grid.Col>
                {projectRevision.changeStatus !== "committed" && (
                  <Grid.Col span={4}>
                    <Button variant="secondary" size="small">
                      Show Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={clearPrimaryContact}
                    >
                      Clear
                    </Button>
                  </Grid.Col>
                )}
              </Grid.Row>
              <label>Secondary Contacts</label>
              {alternateContactForms.map((form) => {
                return (
                  <Grid.Row key={form.id}>
                    <Grid.Col span={6}>
                      <FormBase
                        id={`form-${form.id}`}
                        idPrefix={`form-${form.id}`}
                        ref={(el) => (formRefs.current[form.id] = el)}
                        formData={form.newFormData}
                        onChange={(change) => {
                          updateFormChange(
                            { ...form, changeStatus: "pending" },
                            change.formData
                          );
                        }}
                        schema={contactSchema}
                        uiSchema={uiSchema}
                        ObjectFieldTemplate={EmptyObjectFieldTemplate}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => deleteContact(form.id, form.operation)}
                      >
                        Remove
                      </Button>
                    </Grid.Col>
                  </Grid.Row>
                );
              })}

              <Grid.Row>
                <Grid.Col span={10}>
                  <Button
                    style={{ marginRight: "auto" }}
                    onClick={() =>
                      // allForms is already sorted by contactIndex
                      addContact(
                        allForms[allForms.length - 1].newFormData.contactIndex +
                          1
                      )
                    }
                  >
                    Add
                  </Button>
                </Grid.Col>
              </Grid.Row>
            </FormBorder>
            <Grid.Row>
              <Button
                size="medium"
                variant="primary"
                onClick={stageContactFormChanges}
                disabled={isUpdating}
              >
                Submit Contacts
              </Button>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
};

export default ProjectContactForm;
