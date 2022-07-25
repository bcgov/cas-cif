import Link from "next/link";
import BCGovFooter from "@button-inc/bcgov-theme/Footer";
import footerLinks from "data/dashboardLinks/footerLinks";

const Footer = () => {
  return (
    <BCGovFooter>
      <ul>
        {footerLinks.map(({ name, href }) => (
          <li key={name}>
            <Link href={href}>
              <a target="_blank" style={{ textDecoration: "none" }}>
                {name}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </BCGovFooter>
  );
};

export default Footer;
