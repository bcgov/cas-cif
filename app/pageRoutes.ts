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

export const getProjectRevisionOverviewFormPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/overview/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionManagersFormPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/managers/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionContactsFormPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/contacts/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionQuarterlyReportsFormPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/quarterly-reports/`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionAnnualReportsFormPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/form/annual-reports/`,
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
