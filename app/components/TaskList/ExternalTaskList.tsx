import Link from "next/link";
import { graphql, useFragment } from "react-relay";
import {
  getExternalProjectRevisionPageRoute,
  getExternalProjectRevisionViewPageRoute,
} from "routes/pageRoutes";
import ExternalTaskListSection from "./ExternalTaskListSection";
import { ExternalTaskList_projectRevision$key } from "__generated__/ExternalTaskList_projectRevision.graphql";
import { BC_GOV_LINKS_COLOR, DARK_GREY_BG_COLOR } from "lib/theme/colors";

interface Props {
  projectRevision: ExternalTaskList_projectRevision$key;
}

const ExternalTaskList: React.FC<Props> = ({ projectRevision }) => {
  const { id } = useFragment(
    graphql`
      fragment ExternalTaskList_projectRevision on ProjectRevision {
        id
      }
    `,
    projectRevision
  );
  return (
    <>
      <Link href="/cif-external">{"< Return to Dashboard"}</Link>
      <div className="container">
        <ol>
          <ExternalTaskListSection
            key={"tasklist_section_1"}
            title={"Application Overview"}
            url={getExternalProjectRevisionViewPageRoute(id)}
          ></ExternalTaskListSection>
          <ExternalTaskListSection
            key={"tasklist_section_2"}
            title={"Attachments"}
          ></ExternalTaskListSection>
          <ExternalTaskListSection
            key={"tasklist_section_3"}
            title={"Review"}
            url={getExternalProjectRevisionPageRoute(id)}
          ></ExternalTaskListSection>
          <ExternalTaskListSection
            key={"tasklist_section_4"}
            title={"Declarations"}
          ></ExternalTaskListSection>
          <ExternalTaskListSection
            key={"tasklist_section_5"}
            title={"Submit"}
          ></ExternalTaskListSection>
        </ol>
        <style jsx>{`
          ol {
            list-style: none;
            margin: 0;
          }
          a {
            padding: 10px 0 10px 0;
          }

          h2 {
            font-size: 1.25rem;
            margin: 0;
            padding: 20px 0 10px 0;
            border-bottom: 1px solid #d1d1d1;
            text-indent: 15px;
          }

          div :global(a) {
            color: ${BC_GOV_LINKS_COLOR};
            text-decoration: none;
          }

          div :global(a:hover) {
            text-decoration: underline;
            color: none;
          }

          div.container {
            background-color: ${DARK_GREY_BG_COLOR};
            width: 400px;
            margin-top: 20px;
          }
        `}</style>
      </div>
    </>
  );
};

export default ExternalTaskList;
