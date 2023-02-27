import Link from "next/link";
import BCGovFooter from "@button-inc/bcgov-theme/Footer";
import BCGovLink from "@button-inc/bcgov-theme/Link";

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
                <Link passHref href={href} legacyBehavior>
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
