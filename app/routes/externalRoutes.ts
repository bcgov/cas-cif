import getConfig from "next/config";

///// Metabase
export const getMetabaseRoute = () => ({
  pathname: "https://cas-metabase.nrs.gov.bc.ca/",
});

///// Support email mailto:
export const getSupportEmailMailTo = (subject?: string) => {
  return {
    pathname: `mailto:${getConfig()?.publicRuntimeConfig?.SUPPORT_EMAIL}${
      subject ? `?subject=${subject}` : ""
    }`,
  };
};
