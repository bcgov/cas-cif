import Link from "next/link";
import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";

interface Props {
  projectRevision: TaskList_projectRevision$key;
}

const TaskList: React.FC<Props> = ({ projectRevision }) => {
  const { id } = useFragment(
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
      }
    `,
    projectRevision
  );
  const router = useRouter();

  const determineStepHighlight = (step) => {
    if (!router || !router.pathname) return null;
    if (router.pathname.includes(step)) {
      return "highlight";
    }
    return null;
  };

  const determineSummaryHighlight = () => {
    if (!router || !router.pathname) return null;
    return `${
      router.pathname === "/cif/project-revision/[projectRevision]"
        ? "highlight"
        : null
    } bordered`;
  };

  return (
    <div>
      <h2>Add a Project</h2>
      <ol>
        <li>
          <h3>1. Project Overview</h3>
          <ul className={`${determineStepHighlight("overview")} bordered`}>
            <li>
              <Link href={getProjectRevisionOverviewFormPageRoute(id)}>
                Add project overview
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <h3>2. Project Details (optional)</h3>
          <ul>
            <li className={`${determineStepHighlight("managers")} bordered`}>
              <Link href={getProjectRevisionManagersFormPageRoute(id)}>
                Add project managers
              </Link>
            </li>
            <li className={`${determineStepHighlight("contacts")} bordered`}>
              <Link href={getProjectRevisionContactsFormPageRoute(id)}>
                Add project contacts
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <h3>3. Submit Project</h3>
          <ul className={determineSummaryHighlight()}>
            <li>
              <Link href={getProjectRevisionPageRoute(id)}>
                Review and submit information
              </Link>
            </li>
          </ul>
        </li>
      </ol>
      <style jsx>{`
        ol {
          list-style: none;
          margin: 0;
        }

        ul {
          list-style: none;
          margin: 0;
        }

        li {
          text-indent: 20px;
          margin-bottom: 0;
        }

        h2 {
          font-size: 1.25rem;
          margin: 0;
          padding: 20px 0 10px 0;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 20px;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 20px;
          padding: 10px 0 10px 0;
          margin: 0;
        }

        div :global(a) {
          color: #1a5a96;
        }

        div :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        div :global(.highlight) {
          background-color: #fafafc;
        }
        div :global(.bordered) {
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0;
        }

        div {
          width: 400px;
          background-color: #e5e5e5;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
