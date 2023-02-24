import Link, { LinkProps } from "next/link";

interface BCGovLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  target?: string;
}

const BCGovLink: React.FC<BCGovLinkProps> = ({
  children,
  className,
  target,
  ...props
}): JSX.Element => {
  return (
    <Link {...props} className={className} target={target}>
      {children}
      <style jsx>{`
        :global(body) {
          font-family: "BCSans", "Noto Sans", Verdana, Arial, sans-serif;
          font-size: 18px;
        }
        :global(a) {
          color: #1a5a96;
          text-decoration: underline;
        }
        :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        :global(i.fa-external-link-alt) {
          color: #1a5a96;
        }
      `}</style>
    </Link>
  );
};

export default BCGovLink;
