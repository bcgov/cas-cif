import { createProjectContactUiSchema } from "components/Form/ProjectContactForm";
import projectContactSchema from "data/jsonSchemaForm/projectContactSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectContactFormSummary_projectRevision$key } from "__generated__/ProjectContactFormSummary_projectRevision.graphql";
import { ProjectContactFormSummary_query$key } from "__generated__/ProjectContactFormSummary_query.graphql";
import FormBase from "./FormBase";

interface Props {
  query: ProjectContactFormSummary_query$key;
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
              newFormData
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const { allContacts } = useFragment(
    graphql`
      fragment ProjectContactFormSummary_query on Query {
        allContacts {
          edges {
            node {
              rowId
              id
              fullName
            }
          }
        }
      }
    `,
    props.query
  );
  const primaryContactNode = useMemo(
    () =>
      projectContactFormChanges.edges.find(
        ({ node }) => node.newFormData.contactIndex === 1
      ),
    [projectContactFormChanges.edges]
  );

  const primaryContact = useMemo(() => {
    if (!primaryContactNode) return null;
    return allContacts.edges.find(
      ({ node }) =>
        node.rowId === primaryContactNode?.node.newFormData.contactId
    );
  }, [allContacts, primaryContactNode]);

  const secondaryContacts = useMemo(() => {
    const secondaryContactNodes = projectContactFormChanges.edges.filter(
      ({ node }) => node.newFormData.contactIndex !== 1
    );

    return secondaryContactNodes;
  }, [projectContactFormChanges.edges]);
  const contactsJSX = useMemo(() => {
    return secondaryContacts.map(({ node }) => {
      const nodeContact = allContacts.edges.find(
        (contact) => contact.node.rowId === node.newFormData.contactId
      );
      return (
        <FormBase
          liveValidate
          key={node.newFormData.contactIndex}
          tagName={"dl"}
          theme={readOnlyTheme}
          schema={projectContactSchema as JSONSchema7}
          uiSchema={createProjectContactUiSchema(
            nodeContact ? (
              nodeContact.node.fullName
            ) : (
              <em>No Contact Selected</em>
            )
          )}
          formData={node.newFormData}
          formContext={{
            query: props.query,
            form: node.newFormData,
          }}
        />
      );
    });
  }, [allContacts.edges, props.query, , secondaryContacts]);

  return (
    <>
      <h3>Project Contacts</h3>
      <>
        <label>Primary Contact</label>
        <FormBase
          liveValidate
          key={primaryContact?.node.id}
          tagName={"dl"}
          theme={readOnlyTheme}
          schema={projectContactSchema as JSONSchema7}
          uiSchema={createProjectContactUiSchema(
            primaryContact ? (
              primaryContact?.node.fullName
            ) : (
              <em>Primary contact not added</em>
            )
          )}
          formData={primaryContactNode?.node.newFormData}
          formContext={{
            query: props.query,
            form: primaryContact?.node,
          }}
        />
        <label>Secondary Contacts</label>
        {secondaryContacts.length === 0 ? (
          <div>
            <em>No secondary contacts</em>
          </div>
        ) : (
          contactsJSX
        )}
      </>
    </>
  );
};

export default ProjectContactFormSummary;
