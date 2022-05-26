import { useEffect } from "react";
import { useRouter } from "next/router";
/**
 *  Hook that returns true if the formIndex is out of bounds of the formPages array,
 *  and redirects to the first page of the form.
 *  False otherwise.
 */
export default function useRedirectToValidFormIndex(
  formIndex,
  formPagesLength
) {
  const router = useRouter();
  useEffect(() => {
    if (formIndex < 0 || formIndex >= formPagesLength)
      router.replace(
        `${router.asPath.replace(`/form/${formIndex}`, "/form/0")}`
      );
  }, [formIndex, formPagesLength, router]);
  if (formIndex < 0 || formIndex >= formPagesLength) {
    return true;
  }
  return false;
}
