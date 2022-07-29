import Link from "next/link";
import BCGovFooter from "@button-inc/bcgov-theme/Footer";
import footerLinks from "data/dashboardLinks/footerLinks";
import BCGovLink from "@button-inc/bcgov-theme/Link";

const Footer = () => {
  return (
    <>
      <div>
        <BCGovFooter>
          <ul>
            {footerLinks.map(({ name, href }) => (
              <li key={name}>
                <Link passHref href={href}>
                  <BCGovLink target="_blank">{name}</BCGovLink>
                </Link>
              </li>
            ))}
          </ul>
        </BCGovFooter>
      </div>
      <style jsx>
        {`
          div :global(.pg-footer-footer) {
            height: auto;
          }
          div :global(a) {
            text-decoration: none;
          }
        `}
      </style>
    </>
  );
};

export default Footer;
