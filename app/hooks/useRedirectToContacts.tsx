import { useEffect } from "react";
import { useRouter } from "next/router";
import { getContactsPageRoute } from "pageRoutes";
/**
 *  Hook that redirects to the contacts list page, if the contact being viewed is committed and the `preventRedirect` flag is false.
 *  If the redirect is happening, then the hook returns true, and false otherwise.
 */
export default function useRedirectToContacts(
  changeStatus: string,
  preventRedirect: boolean = false
) {
  const router = useRouter();
  useEffect(() => {
    if (changeStatus === "committed" && !preventRedirect) {
      router.push(getContactsPageRoute());
    }
  }, [changeStatus, preventRedirect, router]);
  if (changeStatus === "committed" && !preventRedirect) {
    return true;
  }
  return false;
}
