import getConfig from "next/config";

const supportEmail = getConfig()?.publicRuntimeConfig?.SUPPORT_EMAIL;

const footerLinks = [
  {
    name: "Login Page",
    href: "https://cif.gov.bc.ca/",
  },
  {
    name: "Disclaimer",
    href: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
  },
  {
    name: "Privacy",
    href: "https://www2.gov.bc.ca/gov/content/home/privacy",
  },
  {
    name: "Accessibility",
    href: "https://www2.gov.bc.ca/gov/content/home/accessible-government",
  },
  {
    name: "Copyright",
    href: "https://www2.gov.bc.ca/gov/content/home/copyright",
  },
  {
    name: "Contact Us",
    href: `mailto:${supportEmail}?subject=CIF App: Report a problem!`,
  },
];

export default footerLinks;
