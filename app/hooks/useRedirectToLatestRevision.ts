import { useEffect } from "react";
import { useRouter } from "next/router";
/**
 *  Hook that returns true if the project revision being viewed is not the latest project revision, and shouldRedirect is true.
 * False otherwise.
 */
export default function useRedirectToLatestRevision(
  projectRevision,
  shouldRedirect
) {
  const router = useRouter();
  useEffect(() => {
    if (
      projectRevision.id !=
        projectRevision?.projectByProjectId?.latestCommittedProjectRevision
          ?.id &&
      shouldRedirect
    )
      router.replace(
        `${router.pathname.replace(
          "[projectRevision]",
          projectRevision.projectByProjectId.latestCommittedProjectRevision.id
        )}`
      );
  }, [projectRevision, shouldRedirect, router]);
  if (
    projectRevision.id !=
      projectRevision?.projectByProjectId?.latestCommittedProjectRevision?.id &&
    shouldRedirect
  ) {
    return true;
  }
  return false;
}
