import { useEffect } from "react";
import { useRouter } from "next/router";
import { getContactsPageRoute } from "pageRoutes";
/**
 *  Hook that returns true if the project revision being viewed is not the latest project revision,
 *  the latest project revision id is not null, and shouldRedirect is true.
 *  False otherwise.
 */
export default function useRedirectToContacts(changeStatus) {
  const router = useRouter();
  useEffect(() => {
    if (changeStatus === "committed") {
      router.push(getContactsPageRoute());
    }
  }, [changeStatus, router]);
  if (changeStatus === "committed") {
    return true;
  }
  return false;
}
