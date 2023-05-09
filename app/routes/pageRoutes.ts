///// Operators

import { TaskListLinkUrl } from "components/TaskList/types";

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

export const getNewProjectRevisionPageRoute = () => ({
  pathname: `/cif/project-revision/new`,
});

export const getProjectRevisionPageRoute = (
  projectRevisionId: string,
  isInternal: boolean = true
) => {
  const userType = isInternal ? "/cif" : "/cif-external";
  return {
    pathname: `${userType}/project-revision/[projectRevision]/`,
    query: {
      projectRevision: projectRevisionId,
    },
  };
};

export const getProjectRevisionFormPageRoute = (
  projectRevisionId: string,
  formIndex: string | number,
  anchor: string = undefined,
  isInternal: boolean = true,
  isRoutedFromNew?: boolean
) => {
  const userType = isInternal ? "/cif" : "/cif-external";
  const urlObject: TaskListLinkUrl = {
    pathname: `${userType}/project-revision/[projectRevision]/form/[formIndex]`,
    query: {
      projectRevision: projectRevisionId,
      formIndex,
    },
  };

  if (anchor) {
    urlObject.query.anchor = anchor;
    urlObject.hash = anchor;
  }

  if (isRoutedFromNew) {
    urlObject.query.isRoutedFromNew = isRoutedFromNew;
  }

  return urlObject;
};

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
  pathname: `/cif/project-revision/[projectRevision]/view`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionEditPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/edit`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getProjectRevisionCreatePageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif/project-revision/[projectRevision]/create`,
  query: {
    projectRevision: projectRevisionId,
  },
});
///// Project

export const getProjectsPageRoute = () => ({
  pathname: "/cif/projects/",
});

export const getAttachmentDownloadRoute = (attachmentId: string) => ({
  pathname: `/download/${attachmentId}`,
});

//// External User

export const getExternalUserLandingPageRoute = () => ({
  pathname: "/cif-external/",
});

export const getExternalProjectRevisionViewPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif-external/project-revision/[projectRevision]/view`,
  query: {
    projectRevision: projectRevisionId,
  },
});

export const getExternalNewProjectRevisionPageRoute = () => ({
  pathname: `/cif-external/project-revision/new`,
});

export const getExternalProjectRevisionFormPageRoute = (
  projectRevisionId: string,
  formIndex: string | number,
  isRoutedFromNew?: boolean
) => {
  const urlObject: TaskListLinkUrl = {
    pathname: `/cif-external/project-revision/[projectRevision]/form/[formIndex]`,
    query: {
      projectRevision: projectRevisionId,
      formIndex,
    },
  };

  if (isRoutedFromNew) {
    urlObject.query.isRoutedFromNew = isRoutedFromNew;
  }

  return urlObject;
};

export const getExternalProjectRevisionPageRoute = (
  projectRevisionId: string
) => ({
  pathname: `/cif-external/project-revision/[projectRevision]/`,
  query: {
    projectRevision: projectRevisionId,
  },
});
