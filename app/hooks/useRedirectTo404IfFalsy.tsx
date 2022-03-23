import { useEffect } from "react";
import { useRouter } from "next/router";
/** 
 *  Hook that returns true if the router will redirect, false otherwise.
 *  - Example usage:
 *    const isRedirecting = useRedirectTo404IfFalsy(object);
 *    if(isRedirecting) return null;
 */
export default function useRedirectTo404IfFalsy(record) {
  const router = useRouter();
  useEffect(() => {
    if (!record) router.replace("/404");
  }, [record, router]);
  if (!record) {
    return true;
  }
  return false;
}
