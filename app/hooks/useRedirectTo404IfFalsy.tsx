import { useEffect } from "react";
import { useRouter } from "next/router";

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
