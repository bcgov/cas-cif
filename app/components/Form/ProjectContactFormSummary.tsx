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
import ContactDetails from "components/Contact/ContactDetails";
import React from "react";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectContactFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectContactFormSummary: React.FC<Props> = (props) => {
  const { summaryContactFormChanges, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectContactFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryContactFormChanges: formChangesFor(
          formDataTableName: "project_contact"
        ) {
          edges {
            node {
              id
              isPristine
              newFormData
              operation
              asProjectContact {
                contactByContactId {
                  fullName
                  ...ContactDetails_contact
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

  // Show diff if it is not the first revision and not view only (rendered from the contacts page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived contacts
  let contactFormChanges = summaryContactFormChanges.edges;
  if (!renderDiff)
    contactFormChanges = summaryContactFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  const primaryContact = useMemo(
    () =>
      contactFormChanges.find(
        ({ node }) => node.newFormData?.contactIndex === 1
      ),
    [contactFormChanges]
  );

  const secondaryContacts = useMemo(
    () =>
      contactFormChanges.filter(
        ({ node }) =>
          node.newFormData?.contactIndex !== 1 &&
          (node.isPristine === false || node.isPristine === null)
      ),
    [contactFormChanges]
  );

  const allFormChangesPristine = useMemo(
    () =>
      !contactFormChanges.some(
        ({ node }) =>
          node.isPristine === false ||
          (node.isPristine === null && node.newFormData?.contactId !== null)
      ),
    [contactFormChanges]
  );

  const secondaryContactFormChangesPristine = useMemo(
    () =>
      !contactFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [contactFormChanges]
  );

  const contactsJSX = useMemo(() => {
    return secondaryContacts.map(({ node }) => {
      return (
        <React.Fragment key={node.id}>
          <FormBase
            liveValidate
            tagName={"dl"}
            fields={renderDiff ? customFields : fields}
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
                node?.formChangeByPreviousFormChangeId?.asProjectContact
                  ?.contactByContactId?.fullName
              ),
            }}
          />
          <ContactDetails contact={node.asProjectContact.contactByContactId} />
        </React.Fragment>
      );
    });
  }, [secondaryContacts, renderDiff]);

  return (
    <div>
      <h3>Project Contacts</h3>
      {allFormChangesPristine && !props.viewOnly ? (
        <p>
          <em>Project Contacts not {isFirstRevision ? "added" : "updated"}</em>
        </p>
      ) : (
        <>
          <label>Primary Contact</label>
          {(primaryContact?.node?.isPristine ||
            (primaryContact?.node?.isPristine === null &&
              !primaryContact.node.newFormData.contactId)) &&
          !props.viewOnly ? (
            <dd>
              <em>Primary contact not updated</em>
            </dd>
          ) : (
            <>
              <FormBase
                liveValidate
                key={primaryContact?.node.id}
                tagName={"dl"}
                theme={readOnlyTheme}
                fields={renderDiff ? customFields : fields}
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
                  primaryContact ? primaryContact.node.newFormData : null
                }
                formContext={{
                  operation: primaryContact?.node.operation,
                  oldData:
                    primaryContact?.node.formChangeByPreviousFormChangeId
                      ?.newFormData,
                  oldUiSchema: createProjectContactUiSchema(
                    primaryContact?.node?.formChangeByPreviousFormChangeId
                      ?.asProjectContact?.contactByContactId?.fullName
                  ),
                }}
              />
              {primaryContact?.node?.asProjectContact?.contactByContactId && (
                <ContactDetails
                  className="contactDetails"
                  contact={
                    primaryContact.node.asProjectContact.contactByContactId
                  }
                />
              )}
            </>
          )}
          <label>Secondary Contacts</label>
          {secondaryContacts.length < 1 && props.viewOnly && (
            <dd>
              <em>No Secondary contacts</em>
            </dd>
          )}
          {(secondaryContactFormChangesPristine ||
            secondaryContacts.length < 1) &&
          !props.viewOnly ? (
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
      <style jsx>{`
        div :global(dl) {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default ProjectContactFormSummary;
