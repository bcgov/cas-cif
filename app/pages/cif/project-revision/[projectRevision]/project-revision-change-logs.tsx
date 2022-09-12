import { graphql, usePreloadedQuery } from "react-relay/hooks";
import Table from "components/Table";
import {
  DisplayOnlyFilter,
  NoHeaderFilter,
  SearchableDropdownFilter,
  SortOnlyFilter,
} from "components/Table/Filters";
import ProjectRevisionTableRow from "../../../../components/ProjectRevision/ProjectRevisionTableRow";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { withRelay, RelayProps } from "relay-nextjs";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { projectRevisionChangeLogsQuery } from "__generated__/projectRevisionChangeLogsQuery.graphql";

const pageQuery = graphql`
  query projectRevisionChangeLogsQuery(
    $projectRevision: ID!
    $offset: Int
    $pageSize: Int
    $orderBy: [ProjectRevisionsOrderBy!]
    $revisionType: String
    $fullName: String
    $amendmentStatus: String
  ) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      project: projectByProjectId {
        projectRevisionChangeLogs: projectRevisionsByProjectId(
          first: $pageSize
          offset: $offset
          filter: {
            revisionType: { includesInsensitive: $revisionType }
            cifUserByUpdatedBy: { fullName: { includesInsensitive: $fullName } }
            amendmentStatus: { includesInsensitive: $amendmentStatus }
          }
          orderBy: $orderBy
        ) @connection(key: "connection_projectRevisionChangeLogs") {
          totalCount
          edges {
            node {
              id
              ...ProjectRevisionTableRow_projectRevision
            }
          }
        }
      }
      ...TaskList_projectRevision
    }
    allRevisionTypes {
      edges {
        node {
          type
        }
      }
    }
    allAmendmentStatuses {
      edges {
        node {
          name
        }
      }
    }
    allAmendmentTypes {
      edges {
        node {
          name
        }
      }
    }
    allCifUsers {
      edges {
        node {
          fullName
        }
      }
    }
  }
`;

const ProjectRevisionChangeLog = ({
  preloadedQuery,
}: RelayProps<{}, projectRevisionChangeLogsQuery>) => {
  const {
    session,
    projectRevision,
    allRevisionTypes,
    allAmendmentStatuses,
    allAmendmentTypes,
    allCifUsers,
  } = usePreloadedQuery(pageQuery, preloadedQuery);
  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  const tableFilters = [
    new SearchableDropdownFilter(
      "Type",
      "revisionType",
      allRevisionTypes.edges.map(({ node }) => node.type)
    ),
    new SortOnlyFilter("Created Date", "createdAt"),
    new SortOnlyFilter("Effective Date", "effectiveDate"),
    new SortOnlyFilter("Last Updated", "updatedAt"),
    new SearchableDropdownFilter(
      "Updated by",
      "fullName",
      allCifUsers.edges.map(({ node }) => node.fullName),
      { orderByPrefix: "CIF_USER_BY_CREATED_BY__FULL_NAME" }
    ),
    new SearchableDropdownFilter(
      "Updated",
      "amendmentType",
      allAmendmentTypes.edges.map(({ node }) => node.name)
    ),
    new SearchableDropdownFilter(
      "Status",
      "amendmentStatus",
      allAmendmentStatuses.edges.map(({ node }) => node.name)
    ),
    new NoHeaderFilter(),
  ];

  return (
    <DefaultLayout session={session} leftSideNav={taskList}>
      <header>
        <h2>Amendments & Other Revisions</h2>
        <Button size="small">New Revision</Button>
      </header>
      <Table
        paginated
        totalRowCount={
          projectRevision.project.projectRevisionChangeLogs.totalCount
        }
        filters={tableFilters}
        pageQuery={pageQuery}
      >
        {projectRevision.project.projectRevisionChangeLogs.edges.map(
          ({ node }) => (
            <ProjectRevisionTableRow key={node.id} projectRevision={node} />
          )
        )}
      </Table>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        header > h2 {
          margin: 0;
        }
      `}</style>
    </DefaultLayout>
  );
};

export default withRelay(ProjectRevisionChangeLog, pageQuery, withRelayOptions);
