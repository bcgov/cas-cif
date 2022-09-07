import { graphql, useFragment } from "react-relay/hooks";
import Table from "components/Table";
import {
  DisplayOnlyFilter,
  NoHeaderFilter,
  TextFilter,
} from "components/Table/Filters";
import ProjectRevisionTableRow from "./ProjectRevisionTableRow";
import { ProjectRevisionChangeLog_projectRevision$key } from "__generated__/ProjectRevisionChangeLog_projectRevision.graphql";

interface Props {
  projectRevision: ProjectRevisionChangeLog_projectRevision$key;
  onSubmit: () => void;
}

const ProjectRevisionChangeLog: React.FC<Props> = (props) => {
  const projectRevisions = useFragment(
    graphql`
      fragment ProjectRevisionChangeLog_projectRevision on ProjectRevision {
        projectByProjectId {
          projectRevisionsByProjectId {
            totalCount
            edges {
              node {
                id
                ...ProjectRevisionTableRow_projectRevision
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const allRevisions =
    projectRevisions.projectByProjectId.projectRevisionsByProjectId;

  // TODO: update these filters from display only to the correct type
  const tableFilters = [
    new DisplayOnlyFilter("Type"),
    new DisplayOnlyFilter("Created Date"),
    new DisplayOnlyFilter("Effective Date"),
    new DisplayOnlyFilter("Last Updated"),
    new TextFilter("Updated by", "updatedBy"),
    new DisplayOnlyFilter("Updated"),
    new DisplayOnlyFilter("Status"),
    new NoHeaderFilter(),
  ];

  return (
    <>
      <Table
        paginated
        totalRowCount={allRevisions.totalCount}
        filters={tableFilters}
      >
        {allRevisions.edges.map(({ node }) => (
          <ProjectRevisionTableRow key={node.id} projectRevision={node} />
        ))}
      </Table>

      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </>
  );
};

export default ProjectRevisionChangeLog;
