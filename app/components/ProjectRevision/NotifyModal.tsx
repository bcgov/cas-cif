import { Button } from "@button-inc/bcgov-theme";
import {
  generateNotifyModalForm,
  generateSchema,
  generateSchemaProperty,
  generateModalUiSchema,
} from "components/helpers";
import React, { useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { NotifyModal_projectRevision$key } from "__generated__/NotifyModal_projectRevision.graphql";
import { useRouter } from "next/router";
import Modal from "@button-inc/bcgov-theme/Modal";
import Link from "next/link";
import getConfig from "next/config";

interface Props {
  projectRevision: NotifyModal_projectRevision$key;
}

const NotifyModal: React.FC<Props> = ({ projectRevision }) => {
  const directorName = getConfig()?.publicRuntimeConfig?.PROGRAM_DIRECTOR_NAME;
  const directorEmail =
    getConfig()?.publicRuntimeConfig?.PROGRAM_DIRECTOR_EMAIL;

  const { id, pendingActionsFrom, projectByProjectId } = useFragment(
    graphql`
      fragment NotifyModal_projectRevision on ProjectRevision {
        id
        pendingActionsFrom
        projectByProjectId {
          proposalReference
          contacts: contactsByProjectContactProjectIdAndContactId {
            edges {
              node {
                email
                fullName
              }
            }
          }
          managers: projectManagersByProjectId {
            edges {
              node {
                cifUserByCifUserId {
                  emailAddress
                  fullName
                }
                projectManagerLabelByProjectManagerLabelId {
                  label
                }
              }
            }
          }
        }
      }
    `,
    projectRevision
  );
  const projectRevisionId = id;
  const router = useRouter();
  // controlling form data like this is necessary because of this bug: https://github.com/rjsf-team/react-jsonschema-form/issues/1023
  const [formData, setFormData] = useState({});
  const [emails, setEmails] = useState({});

  const onChange = (e) => {
    setFormData(e.formData);
    setEmails(e.formData);
  };
  const getManager = (
    managers,
    role:
      | "Ops Team Primary"
      | "Ops Team Secondary"
      | "Tech Team Primary"
      | "Tech Team Secondary"
  ) => {
    return managers.find(({ node }) => {
      return node.projectManagerLabelByProjectManagerLabelId.label === role;
    });
  };

  const primaryOps = useMemo(() => {
    return getManager(projectByProjectId.managers.edges, "Ops Team Primary");
  }, [projectByProjectId.managers.edges]);

  const secondaryOps = useMemo(() => {
    return getManager(projectByProjectId.managers.edges, "Ops Team Secondary");
  }, [projectByProjectId.managers.edges]);

  const primaryTech = useMemo(() => {
    return getManager(projectByProjectId.managers.edges, "Tech Team Primary");
  }, [projectByProjectId.managers.edges]);

  const secondaryTech = useMemo(() => {
    return getManager(projectByProjectId.managers.edges, "Tech Team Secondary");
  }, [projectByProjectId.managers.edges]);

  const primaryContact = useMemo(() => {
    return projectByProjectId.contacts.edges[0];
  }, [projectByProjectId.contacts.edges]);

  const seccondaryContacts = useMemo(() => {
    return projectByProjectId.contacts.edges.slice(1);
  }, [projectByProjectId.contacts.edges]);

  const directorForm = generateNotifyModalForm(
    generateSchema(
      "object",
      "Director",
      generateSchemaProperty(directorEmail, "boolean", directorName, false)
    ),
    onChange,
    formData,
    generateModalUiSchema(directorEmail)
  );

  const primaryContactForm = generateNotifyModalForm(
    generateSchema(
      "object",
      "Project Contact Primary",
      generateSchemaProperty(
        primaryContact?.node.email,
        "boolean",
        primaryContact?.node.fullName,
        false
      )
    ),
    onChange,
    formData,
    generateModalUiSchema(primaryContact?.node.email, "Contacts")
  );

  const generateSecondaryContactsSchemaProperties = () => {
    let properties = {};

    seccondaryContacts.forEach((contact) => {
      let property = generateSchemaProperty(
        contact?.node.email,
        "boolean",
        contact?.node.fullName,
        false
      );
      properties = { ...properties, ...property };
    });

    return properties;
  };

  const generateSecondaryContactsUiSchemaProperties = () => {
    const properties = {};
    for (let i = 1; i < projectByProjectId.contacts.edges.length; i++) {
      properties[projectByProjectId.contacts.edges[i].node.email] = {
        "ui:widget": "ModalWidget",
        "ui:options": {
          label: false,
        },
        pageRedirect: "Contacts",
      };
    }
    return properties;
  };

  const secondaryContactsForm = generateNotifyModalForm(
    generateSchema(
      "object",
      "Project Contact Secondary",
      generateSecondaryContactsSchemaProperties()
    ),
    onChange,
    formData,
    generateSecondaryContactsUiSchemaProperties()
  );

  const generateManagerForm = (
    ordinal: "Primary" | "Secondary",
    managerType: "Ops Team" | "Tech Team"
  ) => {
    const title = managerType + " " + ordinal;
    let manager;
    if (ordinal === "Primary" && managerType === "Ops Team") {
      manager = primaryOps;
    } else if (ordinal === "Secondary" && managerType === "Ops Team") {
      manager = secondaryOps;
    } else if (ordinal === "Primary" && managerType === "Tech Team") {
      manager = primaryTech;
    } else {
      manager = secondaryTech;
    }

    return generateNotifyModalForm(
      generateSchema(
        "object",
        title,
        generateSchemaProperty(
          manager?.node.cifUserByCifUserId.emailAddress,
          "boolean",
          manager?.node.cifUserByCifUserId.fullName,
          false
        )
      ),
      onChange,
      formData,
      generateModalUiSchema(
        manager?.node.cifUserByCifUserId.emailAddress,
        "Managers"
      )
    );
  };

  const generateRecipientsString = useMemo(() => {
    if (Object.keys(emails).length === 0) return "";
    let generatedString = ``;
    for (const email in emails) {
      if (emails?.[email] === true) {
        generatedString += email + `,`;
      }
    }
    return generatedString.slice(0, -1);
  }, [emails]);

  const emailBody = `body=View amendment here: https://cif.gov.bc.ca/cif.project-revision/${projectRevisionId}`;

  const emailSubject = `subject=Amendment%20pending%20your%20actions%20(CIF: ${projectByProjectId.proposalReference})`;

  const emailString = !generateRecipientsString
    ? "javascript;:"
    : `mailto:${generateRecipientsString}?${emailSubject}&${emailBody}`;

  return (
    <Modal id="modal">
      <Modal.Content>
        {pendingActionsFrom === "Director" && directorForm}
        {pendingActionsFrom === "Ops Team" && (
          <>
            {generateManagerForm("Primary", "Ops Team")}
            {generateManagerForm("Secondary", "Ops Team")}
          </>
        )}
        {pendingActionsFrom === "Tech Team" && (
          <>
            {generateManagerForm("Primary", "Tech Team")}
            {generateManagerForm("Secondary", "Tech Team")}
          </>
        )}
        {pendingActionsFrom === "Proponent" && (
          <>
            {primaryContactForm}
            {secondaryContactsForm}
          </>
        )}
        <div className="buttons">
          <Link href={emailString} passHref>
            <Button
              onClick={() => {
                router.back();
              }}
              disabled={emailString === "javascript;:"}
            >
              Notify by Email
            </Button>
          </Link>

          <Button
            variant="secondary"
            onClick={() => {
              router.back();
              setEmails({});
              setFormData({});
            }}
          >
            Cancel
          </Button>
        </div>
        <style jsx>{`
          .buttons {
            display: flex;
            justify-content: space-around;
          }
        `}</style>
      </Modal.Content>
    </Modal>
  );
};

export default NotifyModal;
