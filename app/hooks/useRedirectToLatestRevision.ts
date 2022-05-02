import { useEffect } from "react";
import { useRouter } from "next/router";
/**
 *  Hook that returns true if the project revision being viewed is not the latest project revision, and shouldRedirect is true.
 * False otherwise.
 */
export default function useRedirectToLatestRevision(
  currentRevisionId,
  latestRevisionId,
  shouldRedirect
) {
  const router = useRouter();
  useEffect(() => {
    if (currentRevisionId != latestRevisionId && shouldRedirect)
      router.replace(
        `${router.pathname.replace("[projectRevision]", latestRevisionId)}`
      );
  }, [currentRevisionId, latestRevisionId, shouldRedirect, router]);
  if (currentRevisionId != latestRevisionId && shouldRedirect) {
    return true;
  }
  return false;
}
