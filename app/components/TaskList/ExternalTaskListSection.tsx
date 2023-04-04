import Link from "next/link";
import { TaskListLinkUrl } from "./types";

interface Props {
  title: string;
  url?: TaskListLinkUrl;
}

const ExternalTaskListSection: React.FC<Props> = ({ title, url }) => {
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
          color: #1a5a96;
        }
        }
      `}</style>
    </li>
  );
};

export default ExternalTaskListSection;
