import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useMemo, useRef } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ProjectContactForm_query$key } from "__generated__/ProjectContactForm_query.graphql";
import FormBase from "./FormBase";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as addContactToRevisionMutation } from "mutations/Contact/addContactToRevision";
import { mutation as discardFormChangeMutation } from "mutations/FormChange/discardFormChange";
import { mutation as updateFormChangeMutation } from "mutations/FormChange/updateFormChange";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { ConnectionHandler } from "react-relay";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import validateFormWithErrors from "../../lib/helpers/validateFormWithErrors";

interface Props extends ValidatingFormProps {
  query: ProjectContactForm_query$key;
}

const uiSchema = {
  contactId: {
    "ui:placeholder": "Select a Contact",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
    "ui:options": {
      label: false,
    },
  },
};

const ProjectContactForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const { query } = useFragment(
    graphql`
      fragment ProjectContactForm_query on Query {
        query {
          projectRevision(id: $projectRevision) {
            id
            rowId
            formChangesByProjectRevisionId(
              filter: {
                formDataTableName: { equalTo: "project_contact" }
                deletedAt: { isNull: true }
              }
              first: 2147483647
            )
              @connection(
                key: "connection_formChangesByProjectRevisionId"
                filters: ["deletedAt"]
              ) {
              __id
              edges {
                node {
                  id
                  newFormData
                }
              }
            }
          }
          allContacts {
            edges {
              node {
                rowId
                fullName
              }
            }
          }
        }
      }
    `,
    props.query
  );

  const contactSchema = useMemo(() => {
    const schema = projectContactSchema;
    schema.properties.contactId.anyOf = query.allContacts.edges.map(
      ({ node }) => {
        return {
          type: "number",
          title: node.fullName,
          enum: [node.rowId],
          value: node.rowId,
        } as JSONSchema7Definition;
      }
    );
    return schema as JSONSchema7;
  }, [query]);

  const [addContactMutation] = useMutation(addContactToRevisionMutation);

  const addContact = (contactIndex: number) => {
    addContactMutation({
      variables: {
        input: {
          revisionId: query.projectRevision.rowId,
          contactIndex: contactIndex,
        },
        connections: [
          query.projectRevision.formChangesByProjectRevisionId.__id,
        ],
      },
    });
  };

  const [discardFormChange] = useMutation(discardFormChangeMutation);
  const deleteContact = (formChangeId: string) => {
    const date = new Date().toISOString();
    discardFormChange({
      variables: {
        input: {
          id: formChangeId,
          formChangePatch: {
            deletedAt: date,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          __typename: "UpdateFormChangePayload",
        },
      },
      updater: (store) => {
        const connectionId = ConnectionHandler.getConnectionID(
          query.projectRevision.id,
          "connection_formChangesByProjectRevisionId"
        );
        const connectionRecord = store.get(connectionId);
        ConnectionHandler.deleteNode(connectionRecord, formChangeId);
      },
      onCompleted: () => {
        delete formRefs.current[formChangeId];
      },
    });
  };

  const [applyUpdateFormChangeMutation] = useDebouncedMutation(
    updateFormChangeMutation
  );
  const updateFormChange = (formChangeId: string, formData: any) => {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          id: formChangeId,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeId,
            newFormData: formData,
          },
        },
      },
      debounceKey: formChangeId,
    });
  };

  const allForms = useMemo(() => {
    const contactForms = [
      ...query.projectRevision.formChangesByProjectRevisionId.edges.map(
        ({ node }) => node
      ),
    ];
    contactForms.sort(
      (a, b) => a.newFormData.contactId - b.newFormData.contactId
    );
    return contactForms;
  }, [query]);

  const [primaryContactForm, ...alternateContactForms] = allForms;

  props.setValidatingForm({
    selfValidate: () => {
      return Object.keys(formRefs.current).reduce((agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      }, []);
    },
  });

  const clearPrimaryContact = () => {
    const { contactId, ...newFormData } = primaryContactForm.newFormData;
    updateFormChange(primaryContactForm.id, newFormData);
  };

  return (
    <>
      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder title="Project Contacts">
              <Grid.Row>
                <Grid.Col span={10} className="right-aligned-column">
                  <Button>View Contact List</Button>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row>
                <label>Primary Contact</label>
              </Grid.Row>
              <Grid.Row>
                <Grid.Col span={6}>
                  <FormBase
                    id="primaryContactForm"
                    ref={(el) => (formRefs.current[primaryContactForm.id] = el)}
                    formData={primaryContactForm.newFormData}
                    onChange={(change) => {
                      updateFormChange(primaryContactForm.id, change);
                    }}
                    onFormErrors={() => {}}
                    schema={contactSchema}
                    uiSchema={uiSchema}
                    ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  />
                </Grid.Col>
                <Grid.Col span={4} className="right-aligned-column">
                  <Button variant="secondary">Show Details</Button>
                  <Button variant="secondary" onClick={clearPrimaryContact}>
                    Clear
                  </Button>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row>
                <label>Secondary Contacts</label>
              </Grid.Row>
              {alternateContactForms.map((form) => (
                <Grid.Row key={form.id}>
                  <Grid.Col span={8}>
                    <FormBase
                      id={`form-${form.id}`}
                      ref={(el) => (formRefs.current[form.id] = el)}
                      formData={form.newFormData}
                      onChange={(change) => {
                        updateFormChange(form.id, change);
                      }}
                      onFormErrors={() => {}}
                      schema={contactSchema}
                      uiSchema={uiSchema}
                      ObjectFieldTemplate={EmptyObjectFieldTemplate}
                    />
                  </Grid.Col>
                  <Grid.Col span={2} className="right-aligned-column">
                    <Button
                      variant="secondary"
                      onClick={() => deleteContact(form.id)}
                    >
                      Delete
                    </Button>
                  </Grid.Col>
                </Grid.Row>
              ))}

              <Grid.Row>
                <Grid.Col span={10}>
                  <Button
                    style={{ marginRight: "auto" }}
                    onClick={() =>
                      addContact(
                        alternateContactForms.length > 0
                          ? alternateContactForms[
                              alternateContactForms.length - 1
                            ].newFormData.contactIndex + 1
                          : primaryContactForm.newFormData.contactIndex + 1
                      )
                    }
                  >
                    Add
                  </Button>
                </Grid.Col>
              </Grid.Row>
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        :global(.right-aligned-column > .pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </>
  );
};

export default ProjectContactForm;
