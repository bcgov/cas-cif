import { createProjectContactUiSchema } from "components/Form/ProjectContactForm";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactFormSummary_projectRevision$key } from "__generated__/ProjectContactFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectContactFormSummary_projectRevision$key;
}

const ProjectContactFormSummary: React.FC<Props> = (props) => {
  const { summaryContactFormChanges, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectContactFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryContactFormChanges: projectContactFormChanges {
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
      summaryContactFormChanges.edges.find(
        ({ node }) => node.newFormData?.contactIndex === 1
      ),
    [summaryContactFormChanges.edges]
  );

  const secondaryContacts = useMemo(
    () =>
      summaryContactFormChanges.edges.filter(
        ({ node }) =>
          node.newFormData?.contactIndex !== 1 &&
          (node.isPristine === false || node.isPristine === null)
      ),
    [summaryContactFormChanges.edges]
  );

  const allFormChangesPristine = useMemo(
    () =>
      !summaryContactFormChanges.edges.some(
        ({ node }) =>
          node.isPristine === false ||
          (node.isPristine === null && node.newFormData?.contactId !== null)
      ),
    [summaryContactFormChanges.edges]
  );

  const secondaryContactFormChangesPristine = useMemo(
    () =>
      !summaryContactFormChanges.edges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [summaryContactFormChanges.edges]
  );

  const customFields = useMemo(
    () => ({ ...fields, ...CUSTOM_DIFF_FIELDS }),
    []
  );

  const contactsJSX = useMemo(() => {
    return secondaryContacts.map(({ node }) => {
      return (
        <FormBase
          liveValidate
          key={node.newFormData.contactIndex}
          tagName={"dl"}
          fields={isFirstRevision ? fields : customFields}
          theme={readOnlyTheme}
          schema={projectContactSchema as JSONSchema7}
          uiSchema={createProjectContactUiSchema(
            node?.asProjectContact?.contactByContactId ? (
              node.asProjectContact.contactByContactId.fullName
            ) : (
              <em>No Contact Selected</em>
            )
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
  }, [customFields, isFirstRevision, secondaryContacts]);

  return (
    <>
      <h3>Project Contacts</h3>
      {allFormChangesPristine ? (
        <p>
          <em>Project contacts not {isFirstRevision ? "added" : "updated"}</em>
        </p>
      ) : (
        <>
          <label>Primary Contact</label>
          {primaryContact?.node?.isPristine ||
          (primaryContact?.node?.isPristine === null &&
            !primaryContact.node.newFormData.contactId) ? (
            <dd>
              <em>Primary contact not updated</em>
            </dd>
          ) : (
            <FormBase
              liveValidate
              key={primaryContact?.node.id}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={isFirstRevision ? fields : customFields}
              schema={projectContactSchema as JSONSchema7}
              uiSchema={createProjectContactUiSchema(
                primaryContact ? (
                  primaryContact?.node?.asProjectContact?.contactByContactId
                    ?.fullName
                ) : (
                  <em>Primary contact not added</em>
                )
              )}
              formData={
                primaryContact.node.newFormData.contactId
                  ? primaryContact.node.newFormData
                  : null
              }
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
          <label>Secondary Contacts</label>
          {secondaryContactFormChangesPristine ||
          secondaryContacts.length < 1 ? (
            <dd>
              <em>
                {isFirstRevision
                  ? "No Secondary contacts"
                  : "Secondary contacts not updated"}
              </em>
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
