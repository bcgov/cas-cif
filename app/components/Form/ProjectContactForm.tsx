import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactForm_query$key } from "__generated__/ProjectContactForm_query.graphql";
import FormBase from "./FormBase";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as addContactToRevisionMutation } from "mutations/Contact/addContactToRevision";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import {
  ProjectContactForm_projectRevision$key,
  FormChangeOperation,
} from "__generated__/ProjectContactForm_projectRevision.graphql";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

interface Props extends ValidatingFormProps {
  query: ProjectContactForm_query$key;
  projectRevision: ProjectContactForm_projectRevision$key;
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

  const projectRevision = useFragment(
    graphql`
      fragment ProjectContactForm_projectRevision on ProjectRevision {
        id
        rowId
        projectContactFormChanges(first: 500)
          @connection(key: "connection_projectContactFormChanges") {
          __id
          edges {
            node {
              id
              newFormData
              operation
            }
          }
        }
      }
    `,
    props.projectRevision
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
  }, [allContacts]);

  const [addContactMutation] = useMutationWithErrorMessage(
    addContactToRevisionMutation,
    () => "An error occured"
  );

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
      ...projectRevision.projectContactFormChanges.edges
        .filter(({ node }) => node.operation !== "ARCHIVE")
        .map(({ node }) => node),
    ];
    contactForms.sort(
      (a, b) => a.newFormData.contactIndex - b.newFormData.contactIndex
    );
    return contactForms;
  }, [projectRevision]);

  const [primaryContactForm, ...alternateContactForms] = allForms;
  const [applyUpdateFormChangeMutation] = useUpdateFormChange();
  const [discardFormChange] = useDiscardFormChange(
    projectRevision.projectContactFormChanges.__id
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
    },
    newFormData: any
  ) => {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            ...formChange,
            newFormData,
          },
        },
      },
      debounceKey: formChange.id,
    });
  };

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
    updateFormChange(primaryContactForm, newFormData);
  };

  return (
    <div>
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
                <label htmlFor="primaryContactForm_contactId">
                  Primary Contact
                </label>
              </Grid.Row>
              <Grid.Row>
                <Grid.Col span={6}>
                  <FormBase
                    id="primaryContactForm"
                    idPrefix="primaryContactForm"
                    ref={(el) => (formRefs.current[primaryContactForm.id] = el)}
                    formData={primaryContactForm.newFormData}
                    onChange={(change) => {
                      updateFormChange(primaryContactForm, change.formData);
                    }}
                    schema={contactSchema}
                    uiSchema={uiSchema}
                    ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  />
                </Grid.Col>
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
              </Grid.Row>
              <label>Secondary Contacts</label>
              {alternateContactForms.map((form) => (
                <Grid.Row key={form.id}>
                  <Grid.Col span={6}>
                    <FormBase
                      id={`form-${form.id}`}
                      idPrefix={`form-${form.id}`}
                      ref={(el) => (formRefs.current[form.id] = el)}
                      formData={form.newFormData}
                      onChange={(change) => {
                        updateFormChange(form, change.formData);
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
              ))}

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
