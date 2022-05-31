///// Operators

export const getOperatorsPageRoute = () => ({
  pathname: "/cif/operators/",
});

export const getOperatorViewPageRoute = (operatorId: string) => ({
  pathname: `/cif/operator/[operator]/`,
  query: {
    operator: operatorId,
  },
});

export const getOperatorFormPageRoute = (operatorFormId: string) => ({
  pathname: `/cif/operator/form/[form]/`,
  query: {
    form: operatorFormId,
  },
});

///// Contact

export const getContactsPageRoute = () => ({
  pathname: "/cif/contacts/",
});

export const getContactFormPageRoute = (contactFormId: string) => ({
  pathname: `/cif/contact/form/[contactForm]/`,
  query: {
    contactForm: contactFormId,
  },
});

export const getContactViewPageRoute = (contactId: string) => ({
  pathname: `/cif/contact/[contact]/`,
  query: {
    contact: contactId,
  },
});

///// Project Revision

export const getProjectRevisionPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionFormPageRoute = (
  projectRevisionId: string,
  formIndex: string | number
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/[formIndex]/`,
  query: {
    projectRevision: projectRevisionId,
    formIndex,
  },
});

export const getProjectRevisionAttachmentsPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/attachments/`,
  query: {
    projectRevision: projectRevisionId,
    formIndex: "attachments",
  },
});

///// Project

export const getProjectsPageRoute = () => ({
  pathname: "/cif/projects/",
});

export const getProjectViewPageRoute = (projectId: string) => ({
  pathname: `/cif/project/[project]/`,
  query: {
    project: projectId,
  },
});

export const getAttachmentsPageRoute = (projectId: string) => ({
  pathname: "/cif/project/[project]/attachments",
  query: {
    project: projectId,
  },
});

export const getAttachmentUploadPageRoute = (projectId: string) => ({
  pathname: `/cif/project/[project]/upload-attachment`,
  query: {
    project: projectId,
  },
});

export const getAttachmentViewPageRoute = (attachmentId: string) => ({
  pathname: `/cif/attachments/[attachment]`,
  query: {
    attachment: attachmentId,
  },
});

export const getAttachmentDownloadRoute = (attachmentId: string) => ({
  pathname: `/download/${attachmentId}`,
});
