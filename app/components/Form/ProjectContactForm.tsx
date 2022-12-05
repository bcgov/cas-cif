import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactForm_query$key } from "__generated__/ProjectContactForm_query.graphql";
import FormBase from "./FormBase";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
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
import ContactDetails from "components/Contact/ContactDetails";
import NewContactButton from "./NewContactButton";

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
        projectContactFormChanges: formChangesFor(
          first: 500
          formDataTableName: "project_contact"
        ) @connection(key: "connection_projectContactFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              operation
              changeStatus
              asProjectContact {
                contactByContactId {
                  ...ContactDetails_contact
                }
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );
  const { projectContactFormChanges } = projectRevision;

  const filteredProjectContactFormChanges =
    projectContactFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

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

  const [applyStageFormChangeMutation, isStaging] = useStageFormChange();

  const allForms = useMemo(() => {
    const contactForms = [
      ...filteredProjectContactFormChanges.map(({ node }) => node),
    ];
    contactForms.sort(
      (a, b) => a.newFormData.contactIndex - b.newFormData.contactIndex
    );
    return contactForms;
  }, [filteredProjectContactFormChanges]);

  const [primaryContactForm, ...alternateContactForms] = allForms;
  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateProjectContactFormChange();
  const [discardFormChange] = useDiscardFormChange(
    projectContactFormChanges.__id
  );

  const updateFormChange = (
    formChange: {
      readonly id: string;
      readonly rowId: number;
      readonly newFormData: any;
      readonly operation: FormChangeOperation;
      readonly changeStatus: string;
    },
    newFormData: any
  ) => {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          rowId: formChange.rowId,
          formChangePatch: {
            newFormData,
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
      updateFormChange({ ...primaryContactForm }, change.formData);
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

  const addContact = (contactIndex: number) => {
    // This function aims to prevent race condition for the if-else statement below
    const createContactFn = () => {
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

    // Create primary contact when adding new secondary contact to the project if there is no primary contact
    if (!primaryContactForm) {
      createPrimaryContact({
        variables: {
          connections: [projectRevision.projectContactFormChanges.__id],
          input: {
            projectRevisionId: projectRevision.rowId,
            operation: "CREATE",
            formDataSchemaName: "cif",
            formDataTableName: "project_contact",
            jsonSchemaName: "project_contact",
            newFormData: {
              projectId: projectRevision.projectFormChange.formDataRecordId,
              contactIndex: 1,
            },
            validationErrors: [
              { message: "must have required property contactId" },
            ],
          },
        },
        onCompleted: () => createContactFn(),
      });
    } else {
      createContactFn();
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
          applyStageFormChangeMutation({
            variables: {
              input: {
                rowId: node.rowId,
                formChangePatch: {
                  newFormData: node.newFormData,
                },
              },
            },
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

  const deleteContact = (
    formChangeId: string,
    formChangeRowId: number,
    formChangeOperation: FormChangeOperation
  ) => {
    if (
      primaryContactForm.newFormData.contactId ||
      alternateContactForms.length > 1
    )
      discardFormChange({
        formChange: {
          id: formChangeId,
          rowId: formChangeRowId,
          operation: formChangeOperation,
        },
        onCompleted: () => {
          delete formRefs.current[formChangeId];
        },
      });
    // Will remove the primary contact form change if it is not filled out and we have only one secondary contact form
    // Also, using the undoFormChanges mutation won't work here because it will bring back the primary contact form change
    else
      allForms.forEach((form) => {
        discardFormChange({
          formChange: {
            id: form.id,
            rowId: form.rowId,
            operation: form.operation,
          },
          onCompleted: () => {
            delete formRefs.current[form.id];
          },
        });
      });
  };

  return (
    <div>
      <header>
        <h2>Project Contacts</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding && !isStaging} />
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <label htmlFor="primaryContactForm_contactId">
                Primary Contact
              </label>
              <Grid.Row style={{ marginBottom: "1em" }}>
                <Grid.Col span={6}>
                  <FormBase
                    id="primaryContactForm"
                    validateOnMount={
                      primaryContactForm?.changeStatus === "staged"
                    }
                    idPrefix="primaryContactForm"
                    ref={(el) => (formRefs.current.primaryContact = el)}
                    formData={
                      primaryContactForm?.newFormData || {
                        contactIndex: 1,
                        projectId:
                          projectRevision.projectFormChange.formDataRecordId,
                      }
                    }
                    onChange={handlePrimaryContactChange}
                    schema={contactSchema}
                    uiSchema={uiSchema}
                    ObjectFieldTemplate={EmptyObjectFieldTemplate}
                    className="contact-form"
                  />
                  {/* Using short circuit doesn't work here, It renders a useless submit button */}
                  {!primaryContactForm?.newFormData?.contactId ? (
                    <NewContactButton
                      projectRevisionRowId={projectRevision.rowId}
                      connectionString={
                        projectRevision.projectContactFormChanges.__id
                      }
                      projectContactFormId={primaryContactForm?.id}
                      projectContactFormRowId={primaryContactForm?.rowId}
                      projectId={
                        projectRevision.projectFormChange.formDataRecordId
                      }
                      contactIndex={1}
                    />
                  ) : (
                    <></>
                  )}
                  {primaryContactForm?.asProjectContact?.contactByContactId && (
                    <ContactDetails
                      contact={
                        primaryContactForm.asProjectContact.contactByContactId
                      }
                    />
                  )}
                </Grid.Col>
                {projectRevision.changeStatus !== "committed" && (
                  <Grid.Col span={4}>
                    <Button
                      style={{ marginTop: "0.55rem" }}
                      variant="secondary"
                      size="small"
                      onClick={primaryContactForm && clearPrimaryContact}
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
                        validateOnMount={form.changeStatus === "staged"}
                        idPrefix={`form-${form.id}`}
                        ref={(el) => (formRefs.current[form.id] = el)}
                        formData={form.newFormData}
                        onChange={(change) => {
                          updateFormChange({ ...form }, change.formData);
                        }}
                        schema={contactSchema}
                        uiSchema={uiSchema}
                        ObjectFieldTemplate={EmptyObjectFieldTemplate}
                        className="contact-form"
                      />
                      {/* Using short circuit doesn't work here, It renders a useless submit button */}
                      {!form?.newFormData?.contactId ? (
                        <NewContactButton
                          projectRevisionRowId={projectRevision.rowId}
                          connectionString={
                            projectRevision.projectContactFormChanges.__id
                          }
                          projectContactFormId={form.id}
                          projectContactFormRowId={form?.rowId}
                          projectId={
                            projectRevision.projectFormChange.formDataRecordId
                          }
                          contactIndex={form.newFormData.contactIndex}
                        />
                      ) : (
                        <></>
                      )}
                      {form?.newFormData?.contactId && (
                        <ContactDetails
                          contact={form.asProjectContact.contactByContactId}
                        />
                      )}
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() =>
                          deleteContact(form.id, form.rowId, form.operation)
                        }
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
                    variant="secondary"
                    style={{ marginRight: "auto", marginLeft: "unset" }}
                    onClick={() =>
                      // allForms is already sorted by contactIndex
                      addContact(
                        // if the primary contact not yet added, we pass 2 as the contactIndex and create the primary contact in the addContact function
                        primaryContactForm
                          ? allForms[allForms.length - 1].newFormData
                              .contactIndex + 1
                          : 2
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> Add a Secondary
                    Contact
                  </Button>
                </Grid.Col>
              </Grid.Row>
            </FormBorder>
            <Grid.Row>
              <Button
                size="medium"
                variant="primary"
                onClick={stageContactFormChanges}
                disabled={isUpdating || isStaging}
              >
                Submit Project Contacts
              </Button>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
          margin-top: 0.6em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
        div :global(.contact-form) {
          height: 4.25em;
        }
      `}</style>
    </div>
  );
};

export default ProjectContactForm;
