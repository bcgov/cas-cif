import { createProjectContactUiSchema } from "components/Form/ProjectContactForm";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactFormSummary_projectRevision$key } from "__generated__/ProjectContactFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import CUSTOM_FIELDS from "lib/theme/CustomFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectContactFormSummary_projectRevision$key;
}

const ProjectContactFormSummary: React.FC<Props> = (props) => {
  const { projectContactFormChanges } = useFragment(
    graphql`
      fragment ProjectContactFormSummary_projectRevision on ProjectRevision {
        projectContactFormChanges(
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) {
          edges {
            node {
              isPristine
              newFormData
              operation
              asProjectContact {
                contactByContactId {
                  fullName
                }
              }
              formChangeByPreviousFormChangeId {
                newFormData
                asProjectContact {
                  contactByContactId {
                    fullName
                  }
                }
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const primaryContact = useMemo(
    () =>
      projectContactFormChanges.edges.find(
        ({ node }) => node.newFormData.contactIndex === 1
      ),
    [projectContactFormChanges.edges]
  );

  const secondaryContacts = useMemo(
    () =>
      projectContactFormChanges.edges.filter(
        ({ node }) =>
          node.newFormData.contactIndex !== 1 &&
          (node.isPristine === false || node.isPristine === null)
      ),
    [projectContactFormChanges.edges]
  );

  const allFormChangesPristine = useMemo(
    () =>
      !projectContactFormChanges.edges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [projectContactFormChanges.edges]
  );

  const secondaryContactFormChangesPristine = useMemo(
    () =>
      !projectContactFormChanges.edges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [projectContactFormChanges.edges]
  );

  // Set custom rjsf fields to display diffs
  const customFields = useMemo(() => ({ ...fields, ...CUSTOM_FIELDS }), []);

  const contactsJSX = useMemo(() => {
    return secondaryContacts.map(({ node }) => {
      return (
        <FormBase
          key={node.newFormData.contactIndex}
          tagName={"dl"}
          fields={customFields}
          theme={readOnlyTheme}
          schema={projectContactSchema as JSONSchema7}
          uiSchema={createProjectContactUiSchema(
            node.asProjectContact.contactByContactId.fullName
          )}
          formData={node.newFormData}
          formContext={{
            operation: node.operation,
            oldData: node.formChangeByPreviousFormChangeId?.newFormData,
            oldUiSchema: createProjectContactUiSchema(
              node.asProjectContact?.contactByContactId?.fullName
            ),
          }}
        />
      );
    });
  }, [secondaryContacts, customFields]);

  return (
    <>
      <h3>Project Contacts</h3>

      {allFormChangesPristine ? (
        <p>
          <em>Project contacts not updated</em>
        </p>
      ) : (
        <>
          <label>Primary Contact</label>
          {primaryContact?.node?.isPristine ||
          !primaryContact.node.newFormData.contactId ? (
            <dd>
              <em>Primary Contact not updated</em>
            </dd>
          ) : (
            <FormBase
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={customFields}
              schema={projectContactSchema as JSONSchema7}
              uiSchema={createProjectContactUiSchema(
                primaryContact?.node?.asProjectContact?.contactByContactId
                  ?.fullName
              )}
              formData={primaryContact.node.newFormData}
              formContext={{
                operation: primaryContact.node.operation,
                oldData:
                  primaryContact.node.formChangeByPreviousFormChangeId
                    ?.newFormData,
                oldUiSchema: createProjectContactUiSchema(
                  primaryContact?.node?.formChangeByPreviousFormChangeId
                    ?.asProjectContact?.contactByContactId?.fullName
                ),
              }}
            />
          )}
          {<label>Secondary Contacts</label>}
          {secondaryContactFormChangesPristine ||
          secondaryContacts.length < 1 ? (
            <dd>
              <em>Secondary Contacts not updated</em>
            </dd>
          ) : (
            contactsJSX
          )}
        </>
      )}
    </>
  );
};

export default ProjectContactFormSummary;
