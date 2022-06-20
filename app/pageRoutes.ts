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
  projectContactFormId: string,
  projectId: number,
  contactIndex?: number
) => ({
  pathname: `/cif/contact/form/[contactForm]/`,
  query: {
    contactForm: contactFormId,
    projectContactFormId: projectContactFormId,
    projectId: projectId,
    contactIndex: contactIndex,
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
