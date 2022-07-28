import Link from "next/link";
import BCGovFooter from "@button-inc/bcgov-theme/Footer";
import footerLinks from "data/dashboardLinks/footerLinks";
import BCGovLink from "@button-inc/bcgov-theme/Link";

const Footer = () => {
  return (
    <BCGovFooter>
      <ul>
        {footerLinks.map(({ name, href }) => (
          <li key={name}>
            <Link passHref href={href}>
              <BCGovLink target="_blank" style={{ textDecoration: "none" }}>
                {name}
              </BCGovLink>
            </Link>
          </li>
        ))}
      </ul>
    </BCGovFooter>
  );
};

export default Footer;
