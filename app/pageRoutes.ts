export const getProjectsPageRoute = () => ({
  pathname: "/cif/projects/",
});

export const getOperatorsPageRoute = () => ({
  pathname: "/cif/operators/",
});

export const getContactsPageRoute = () => ({
  pathname: "/cif/contacts/",
});

export const getProjectRevisionPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/`,
  query: {
    projectRevision: projectRevisionId,
  },
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
