import getConfig from "next/config";

///// Metabase
export const getMetabaseRoute = () => ({
  pathname: "https://cas-metabase.nrs.gov.bc.ca/",
});

///// Support email mailto:
const supportEmail = getConfig()?.publicRuntimeConfig?.SUPPORT_EMAIL;
export const getSupportEmailMailTo = (subject?: string) => ({
  pathname: `mailto:${supportEmail}${subject ? `?subject=${subject}` : ""}`,
});
