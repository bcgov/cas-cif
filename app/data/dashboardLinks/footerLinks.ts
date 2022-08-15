import { getSupportEmailMailTo } from "routes/externalRoutes";

const footerLinks = [
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
    href: getSupportEmailMailTo("CIF App: Report a problem!").pathname,
  },
];

export default footerLinks;
