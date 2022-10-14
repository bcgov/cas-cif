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

export const getContactFormPageRoute = (
  contactFormId: string,
  // Optional queries are used to create new contact and redirect the user to back to the project contact form
  projectContactFormId?: string,
  projectId?: number,
  contactIndex?: number,
  projectRevisionRowId?: number,
  connectionString?: string,
  projectContactFormRowId?: number
) => ({
  pathname: `/cif/contact/form/[contactForm]/`,
  query: {
    contactForm: contactFormId,
    projectContactFormId: projectContactFormId,
    projectContactFormRowId: projectContactFormRowId,
    projectId: projectId,
    contactIndex: contactIndex,
    projectRevisionRowId: projectRevisionRowId,
    connectionString: connectionString,
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
  formIndex: string | number,
  anchor?: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/[formIndex]`,
  query: {
    projectRevision: projectRevisionId,
    formIndex,
    anchor: anchor,
  },
});

export const getProjectRevisionAttachmentsPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/attachments/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionChangeLogsPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/project-revision-change-logs`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionViewPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/project-revision-view`,
  query: {
    projectRevision: projectRevisionId,
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

export const getAttachmentDownloadRoute = (attachmentId: string) => ({
  pathname: `/download/${attachmentId}`,
});
