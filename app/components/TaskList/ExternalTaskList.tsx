import { ExternalTaskList_projectRevision$key } from "__generated__/ExternalTaskList_projectRevision.graphql";

import TaskListSection from "./TaskListSection";

interface Props {
  projectRevision: ExternalTaskList_projectRevision$key;
}
const ExternalTaskList: React.FC<Props> = ({}) => {
  return (
    <div className="container">
      <ol>
        <TaskListSection
          key={"tasklist_section_1"}
          defaultExpandedState={false}
          listItemName={"Application Overview"}
          listItemMode={""}
          renderCaret={false}
        >
          {null}
        </TaskListSection>
        <TaskListSection
          key={"tasklist_section_2"}
          defaultExpandedState={false}
          listItemName={"Attachments"}
          listItemMode={""}
          renderCaret={false}
        >
          {null}
        </TaskListSection>
        <TaskListSection
          key={"tasklist_section_3"}
          defaultExpandedState={false}
          listItemName={"Review"}
          listItemMode={""}
          renderCaret={false}
        >
          {null}
        </TaskListSection>
        <TaskListSection
          key={"tasklist_section_4"}
          defaultExpandedState={false}
          listItemName={"Declarations"}
          listItemMode={""}
          renderCaret={false}
        >
          {null}
        </TaskListSection>
        <TaskListSection
          key={"tasklist_section_5"}
          defaultExpandedState={false}
          listItemName={"Submit"}
          listItemMode={""}
          renderCaret={false}
        >
          {null}
        </TaskListSection>
      </ol>
      <style jsx>{`
        ol {
          list-style: none;
          margin: 0;
        }

        h2 {
          font-size: 1.25rem;
          margin: 0;
          padding: 20px 0 10px 0;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
        }

        div :global(a) {
          color: #1a5a96;
        }

        div :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        div.container {
          background-color: #e5e5e5;
          width: 400px;
        }
      `}</style>
    </div>
  );
};

export default ExternalTaskList;
