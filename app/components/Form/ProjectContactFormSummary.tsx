import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactFormSummary_projectRevision$key } from "__generated__/ProjectContactFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import ContactDetails from "components/Contact/ContactDetails";
import React from "react";
import { SummaryFormProps } from "data/formPages/types";
import { FormNotAddedOrUpdated } from "./SummaryFormCommonComponents";
import { createProjectContactUiSchema } from "./ProjectContactForm";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectContactFormSummary_projectRevision$key> {}

const ProjectContactFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const {
    summaryContactFormChanges,
    isFirstRevision,
    latestCommittedProjectContactFormChanges,
  } = useFragment(
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
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        latestCommittedProjectContactFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "project_contact"
        ) {
          edges {
            node {
              id
              isPristine
              newFormData
              asProjectContact {
                contactByContactId {
                  fullName
                  ...ContactDetails_contact
                }
              }
            }
          }
        }
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the contacts page)
  const renderDiff = !isFirstRevision && !viewOnly;

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

  const lastCommittedPrimaryContact = useMemo(
    () =>
      latestCommittedProjectContactFormChanges?.edges?.find(
        ({ node }) => node.newFormData?.contactIndex === 1
      ),
    [latestCommittedProjectContactFormChanges]
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

  // brianna these are
  const lastCommittedSecondaryContacts = useMemo(
    () =>
      latestCommittedProjectContactFormChanges?.edges?.filter(
        ({ node }) =>
          node.newFormData?.contactIndex !== 1 &&
          (node.isPristine === false || node.isPristine === null)
      ),
    [latestCommittedProjectContactFormChanges?.edges]
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
      const latestCommittedContactNode = lastCommittedSecondaryContacts.find(
        (latestCommittedNode) => {
          return (
            latestCommittedNode.node.newFormData.contactIndex ===
            node.newFormData.contactIndex
          );
        }
      );

      const latestCommittedUiSchema = createProjectContactUiSchema(
        latestCommittedContactNode?.node?.asProjectContact?.contactByContactId
          ?.fullName
      );

      return (
        <React.Fragment key={node.id}>
          <FormBase
            liveValidate
            tagName={"dl"}
            fields={renderDiff ? customFields : fields}
            theme={readOnlyTheme}
            schema={node.formByJsonSchemaName.jsonSchema.schema}
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
              latestCommittedData:
                latestCommittedContactNode?.node?.newFormData,
              latestCommittedUiSchema,
              isAmendmentsAndOtherRevisionsSpecific:
                isOnAmendmentsAndOtherRevisionsPage,
            }}
          />
          {!isOnAmendmentsAndOtherRevisionsPage && (
            <ContactDetails
              contact={node.asProjectContact.contactByContactId}
            />
          )}
        </React.Fragment>
      );
    });
  }, [
    secondaryContacts,
    renderDiff,
    isOnAmendmentsAndOtherRevisionsPage,
    summaryContactFormChanges,
  ]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () =>
      setHasDiff &&
      setHasDiff(
        (prevState) =>
          // we need to check previous value since this form and the project managers form are rendered under same CollapsibleFormWidget
          prevState ||
          (!allFormChangesPristine && !secondaryContactFormChangesPristine)
      ),
    [allFormChangesPristine, secondaryContactFormChangesPristine, setHasDiff]
  );

  const primaryContactNotUpdated =
    primaryContact?.node?.isPristine ||
    (primaryContact?.node?.isPristine === null &&
      !primaryContact.node.newFormData.contactId);

  const primaryContactForm = useMemo(() => {
    return (
      <div className="contactFormContainer">
        <label>Primary Contact</label>
        {(primaryContact?.node?.isPristine ||
          (primaryContact?.node?.isPristine === null &&
            !primaryContact.node.newFormData.contactId)) &&
        !viewOnly ? (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Primary Contact"
          />
        ) : (
          <>
            <FormBase
              liveValidate
              key={primaryContact?.node.id}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={
                primaryContact?.node.formByJsonSchemaName.jsonSchema.schema
              }
              uiSchema={createProjectContactUiSchema(
                primaryContact ? (
                  primaryContact?.node?.asProjectContact?.contactByContactId
                    ?.fullName
                ) : (
                  <em>Primary Contact not added</em>
                )
              )}
              formData={primaryContact ? primaryContact.node.newFormData : null}
              formContext={{
                operation: primaryContact?.node.operation,
                oldData:
                  primaryContact?.node.formChangeByPreviousFormChangeId
                    ?.newFormData,
                oldUiSchema: createProjectContactUiSchema(
                  primaryContact?.node?.formChangeByPreviousFormChangeId
                    ?.asProjectContact?.contactByContactId?.fullName
                ),
                latestCommittedData:
                  lastCommittedPrimaryContact?.node?.newFormData,
                latestCommittedUiSchema: createProjectContactUiSchema(
                  lastCommittedPrimaryContact?.node?.asProjectContact
                    ?.contactByContactId?.fullName
                ),
                isAmendmentsAndOtherRevisionsSpecific:
                  isOnAmendmentsAndOtherRevisionsPage,
              }}
            />
            {primaryContact?.node?.asProjectContact?.contactByContactId &&
              !isOnAmendmentsAndOtherRevisionsPage && (
                <ContactDetails
                  className="contactDetails"
                  contact={
                    primaryContact.node.asProjectContact.contactByContactId
                  }
                />
              )}
          </>
        )}
      </div>
    );
  }, [
    isFirstRevision,
    isOnAmendmentsAndOtherRevisionsPage,
    primaryContact,
    renderDiff,
    viewOnly,
    summaryContactFormChanges,
  ]);

  if (
    isOnAmendmentsAndOtherRevisionsPage &&
    allFormChangesPristine &&
    secondaryContactFormChangesPristine
  )
    return null;

  return (
    <div>
      <h3>Project Contacts</h3>
      {allFormChangesPristine && !viewOnly ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Contacts"
        />
      ) : (
        <>
          {!isOnAmendmentsAndOtherRevisionsPage ? (
            <>
              {primaryContactForm}
              <div>
                <label>Secondary Contacts</label>
                {secondaryContacts.length < 1 && viewOnly && (
                  <FormNotAddedOrUpdated
                    isFirstRevision={true} //setting this to true so that the text is "Secondary Contacts not added"
                    formTitle="Secondary Contacts"
                  />
                )}
                {(secondaryContactFormChangesPristine ||
                  secondaryContacts.length < 1) &&
                !viewOnly ? (
                  <FormNotAddedOrUpdated
                    isFirstRevision={isFirstRevision}
                    formTitle="Secondary Contacts"
                  />
                ) : (
                  contactsJSX
                )}
              </div>
            </>
          ) : (
            <>
              {!primaryContactNotUpdated && primaryContactForm}
              {secondaryContacts.length > 0 && (
                <div className="contactFormContainer">
                  <label>Secondary Contacts</label>
                  {contactsJSX}
                </div>
              )}
            </>
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
