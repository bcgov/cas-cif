import Link from "next/link";
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

  return (
    <div>
      <h2>Add a Project</h2>
      <ol>
        <li>
          <h3>1. Project Overview</h3>
          <ul>
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
            <li>
              <Link href={getProjectRevisionManagersFormPageRoute(id)}>
                Add project managers
              </Link>
            </li>
            <li>
              <Link href={getProjectRevisionContactsFormPageRoute(id)}>
                Add project contacts
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <h3>3. Submit Project</h3>
          <ul>
            <li>
              <Link href={getProjectRevisionPageRoute(id)}>
                Review and submit information
              </Link>
            </li>
          </ul>
        </li>
      </ol>
      <style jsx>{`
        ol,
        ul {
          list-style: none;
          margin-left: 0;
          margin-bottom: 0;
        }

        h2 {
          font-size: 1.25rem;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          margin-bottom: 0;
        }

        div :global(a) {
          color: #1a5a96;
        }

        div :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        div {
          border: 2px solid black;
          width: 400px;
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
