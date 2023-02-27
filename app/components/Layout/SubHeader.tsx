import { BaseHeader } from "@button-inc/bcgov-theme/Header";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { match } from "path-to-regexp";

interface Props {
  links: { name: string; href: { pathname: string }; highlightOn: string[] }[];
}

export default function SubHeader(props: Props) {
  const router = useRouter();

  const highlightedLinkName = useMemo(() => {
    const highlightedLink = props.links?.find(({ highlightOn }) =>
      highlightOn.some((routePath) =>
        match(routePath, { decode: decodeURIComponent, endsWith: "?" })(
          router?.asPath
        )
      )
    );
    if (highlightedLink) return highlightedLink.name;
    return "Home";
  }, [router]);

  return (
    <BaseHeader header="sub">
      <ul>
        <li>
          <Link
            href="/cif"
            className={highlightedLinkName === "Home" ? "highlight" : ""}
          >
            Home
          </Link>
        </li>
        {props.links?.map(({ name, href }) => (
          <li key={name}>
            <Link
              href={href}
              className={highlightedLinkName === name ? "highlight" : ""}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .highlight {
          text-decoration: underline;
        }
      `}</style>
    </BaseHeader>
  );
}
