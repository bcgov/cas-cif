import { BaseHeader } from "@button-inc/bcgov-theme/Header";
import Link from "next/link";
import { useRouter } from "next/router";
import subHeaderLinks from "data/subHeaderLinks";
import { useMemo } from "react";
import { match } from "path-to-regexp";

export default function SubHeader() {
  const router = useRouter();

  const highlightedLinkName = useMemo(() => {
    const highlightedLink = subHeaderLinks.find(({ highlightOn }) =>
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
          <Link href="/cif">
            <a className={highlightedLinkName === "Home" ? "highlight" : ""}>
              Home
            </a>
          </Link>
        </li>
        {subHeaderLinks.map(({ name, href }) => (
          <li key={name}>
            <Link href={href}>
              <a className={highlightedLinkName === name ? "highlight" : ""}>
                {name}
              </a>
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
