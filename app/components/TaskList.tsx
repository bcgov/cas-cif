import Link from "next/link";
import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";

interface Props {
  projectRevision: TaskList_projectRevision$key;
}

const getStatus = (
  forms: Array<{
    changeStatus: string;
    isPristine: boolean;
    validationErrors: any[];
  }>
) => {
  if (
    forms.some((form) => form?.changeStatus === "pending" && !form.isPristine)
  )
    return "Incomplete";

  if (
    forms.some(
      (form) =>
        form.changeStatus === "staged" && form.validationErrors.length > 0
    )
  )
    return <strong>Attention Required</strong>;

  if (
    forms.every(
      (form) =>
        form.changeStatus === "staged" && form.validationErrors.length === 0
    ) &&
    forms.some((form) => !form.isPristine)
  )
    return "Complete";

  return "Not Started";
};

const TaskList: React.FC<Props> = ({ projectRevision }) => {
  const {
    id,
    projectByProjectId,
    projectFormChange,
    tasklistProjectContactFormChanges,
    projectManagerFormChanges,
  } = useFragment(
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        projectByProjectId {
          proposalReference
        }
        projectFormChange {
          changeStatus
          isPristine
          validationErrors
        }
        tasklistProjectContactFormChanges: projectContactFormChanges(
          first: 1000
        ) @connection(key: "taskList_tasklistProjectContactFormChanges") {
          edges {
            node {
              changeStatus
              isPristine
              validationErrors
            }
          }
        }
        projectManagerFormChanges: projectManagerFormChangesByLabel(first: 500)
          @connection(key: "taskList_projectManagerFormChanges") {
          edges {
            node {
              formChange {
                changeStatus
                isPristine
                validationErrors
              }
            }
          }
        }
      }
    `,
    projectRevision
  );
  const router = useRouter();

  let mode = projectByProjectId ? "update" : "create";

  const projectOverviewStatus = useMemo(
    () => getStatus([projectFormChange]),
    [projectFormChange]
  );

  const projectManagerStatus = useMemo(
    () =>
      getStatus(
        projectManagerFormChanges.edges
          .filter(({ node }) => node && node.formChange)
          .map(({ node }) => node.formChange)
      ),
    [projectManagerFormChanges]
  );

  const projectContactStatus = useMemo(
    () =>
      getStatus(
        tasklistProjectContactFormChanges.edges.map(({ node }) => node)
      ),
    [tasklistProjectContactFormChanges]
  );

  const currentStep = useMemo(() => {
    if (!router || !router.pathname) return null;
    if (`${router.pathname}/` === getProjectRevisionPageRoute(id).pathname)
      return "summary";
    const routeParts = router.pathname.split("/");
    return routeParts[routeParts.length - 1];
  }, [id, router]);

  return (
    <div className="container">
      <h2>
        {projectByProjectId
          ? "Editing: " + projectByProjectId.proposalReference
          : "Add a Project"}
      </h2>
      <ol>
        <li>
          <h3>1. Project Overview</h3>
          <ul>
            <li
              aria-current={currentStep === "overview" ? "step" : false}
              className="bordered"
            >
              <Link href={getProjectRevisionOverviewFormPageRoute(id)}>
                <a>{mode === "update" ? "Edit" : "Add"} project overview</a>
              </Link>
              <div className="status">{projectOverviewStatus}</div>
            </li>
          </ul>
        </li>
        <li>
          <h3>2. Project Details {mode === "update" ? "" : "(optional)"}</h3>
          <ul>
            <li
              aria-current={currentStep === "managers" ? "step" : false}
              className="bordered"
            >
              <Link href={getProjectRevisionManagersFormPageRoute(id)}>
                <a>{mode === "update" ? "Edit" : "Add"} project managers</a>
              </Link>
              <div className="status">{projectManagerStatus}</div>
            </li>
            <li
              aria-current={currentStep === "contacts" ? "step" : false}
              className="bordered"
            >
              <Link href={getProjectRevisionContactsFormPageRoute(id)}>
                <a>{mode === "update" ? "Edit" : "Add"} project contacts</a>
              </Link>
              <div className="status">{projectContactStatus}</div>
            </li>
          </ul>
        </li>
        <li>
          <h3>3. Submit changes</h3>
          <ul>
            <li
              aria-current={currentStep === "summary" ? "step" : false}
              className="bordered"
            >
              <div>
                <Link href={getProjectRevisionPageRoute(id)}>
                  Review and submit information
                </Link>
              </div>
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
          text-indent: 15px;
          margin-bottom: 0;
        }

        h2 {
          font-size: 1.25rem;
          margin: 0;
          padding: 20px 0 10px 0;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
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

        li[aria-current="step"],
        li[aria-current="step"] div {
          background-color: #fafafc;
        }

        .bordered {
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0;
        }

        div.container {
          background-color: #e5e5e5;
          width: 400px;
        }

        ul > li {
          display: flex;
          justify-content: space-between;
        }

        .status {
          text-align: right;
          padding-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
