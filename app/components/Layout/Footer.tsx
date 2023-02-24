import BCGovFooter from "@button-inc/bcgov-theme/Footer";
import BCGovLink from "components/BCGovLink";
import footerLinks from "data/dashboardLinks/footerLinks";

interface Props {
  links: { name: string; href: string }[];
}

const Footer = (props: Props) => {
  return (
    <>
      <div>
        <BCGovFooter>
          <ul>
            {props.links?.map(({ name, href }) => (
              <li key={name}>
                <BCGovLink passHref href={href} target="_blank">
                  {name}
                </BCGovLink>
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
