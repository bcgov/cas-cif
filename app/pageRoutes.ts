export const getProjectListPageRoute = () => ({
  pathname: "/cif/projects/",
});

export const getProjectRevisionPageRoute = (projectRevisionId: string) => ({
  pathname: `/cif/project-revision/[projectRevision]/`,
  query: {
    projectRevision: projectRevisionId,
  },
});
