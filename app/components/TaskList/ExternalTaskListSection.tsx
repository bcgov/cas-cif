import Link from "next/link";
import { useRouter } from "next/router";
import { TaskListLinkUrl } from "./types";
import { BC_GOV_LINKS_COLOR } from "lib/theme/colors";

interface Props {
  title: string;
  url?: TaskListLinkUrl;
}

const removeTrailingSlash = (url: string) => {
  if (url?.slice(-1) === "/") {
    return url.slice(0, -1);
  }
  return url;
};
const ExternalTaskListSection: React.FC<Props> = ({ title, url }) => {
  const router = useRouter();
  const textDecoration =
    removeTrailingSlash(router.pathname) === removeTrailingSlash(url?.pathname)
      ? "underline"
      : "none";
  return (
    <li>
      <h3>{url ? <Link href={url}>{title}</Link> : title}</h3>
      <style jsx>{`
        li {
          margin-bottom: 0;
          padding: 0.2em 0.5em 0.2em 0.5em;
        }
        a {
          text
        }
        a:link {
          text-decoration: none;
        }
        a:visited {
          text-decoration: none;
        }
        a:hover {
          text-decoration: none;
        }
        a:active {
          text-decoration: none;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0;
          margin: 0;
          display: flex;
          justify-content: space-between;
          color: ${BC_GOV_LINKS_COLOR};
          text-decoration: ${textDecoration};
        }
        }
      `}</style>
    </li>
  );
};

export default ExternalTaskListSection;
