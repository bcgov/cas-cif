import {
  getContactsPageRoute,
  getOperatorsPageRoute,
  getProjectsPageRoute,
} from "routes/pageRoutes";

const subHeaderLinks = [
  {
    name: "Projects",
    href: getProjectsPageRoute(),
    highlightOn: ["/cif/project(.*)"],
  },
  {
    name: "Operators",
    href: getOperatorsPageRoute(),
    highlightOn: ["/cif/operator(.*)"],
  },
  {
    name: "Contacts",
    href: getContactsPageRoute(),
    highlightOn: ["/cif/contact(.*)"],
  },
];

export default subHeaderLinks;
