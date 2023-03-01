/* eslint-disable relay/graphql-naming */
import ExternalLayout from "components/Layout/ExternalLayout";
import ProjectTableRow from "components/Project/ProjectTableRow";
import Table from "components/Table";
import {
  NoHeaderFilter,
  SearchableDropdownFilter,
  TextFilter,
} from "components/Table/Filters";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useMemo } from "react";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { cifExternalQuery } from "__generated__/cifExternalQuery.graphql";

export const ExternalProjectsQuery = graphql`
  query cifExternalQuery(
    $projectName: String
    $proposalReference: String
    $status: String
    $offset: Int
    $pageSize: Int
    $orderBy: [ProjectsOrderBy!]
  ) {
    session {
      ...ExternalLayout_session
    }
    allProjects(
      first: $pageSize
      offset: $offset
      filter: {
        projectName: { includesInsensitive: $projectName }
        proposalReference: { includesInsensitive: $proposalReference }
        projectStatusByProjectStatusId: {
          name: { includesInsensitive: $status }
        }
        # hardcoding an operator so that everyone who tests and demos this can have the same experience
        operatorByOperatorId: {
          tradeName: { equalTo: "external testing operator" }
        }
      }
      orderBy: $orderBy
    ) {
      totalCount
      edges {
        node {
          id
          ...ProjectTableRow_project
        }
      }
    }
    allProjectStatuses {
      edges {
        node {
          name
        }
      }
    }
  }
`;

export function ExternalProjects({
  preloadedQuery,
}: RelayProps<{}, cifExternalQuery>) {
  const { allProjects, allProjectStatuses, session } = usePreloadedQuery(
    ExternalProjectsQuery,
    preloadedQuery
  );

  const tableFilters = useMemo(
    () => [
      new TextFilter("Proposal Reference", "proposalReference"),
      new TextFilter("Project Name", "projectName"),
      new SearchableDropdownFilter(
        "Status",
        "status",
        allProjectStatuses.edges.map((e) => e.node.name),
        { orderByPrefix: "PROJECT_STATUS_BY_PROJECT_STATUS_ID__NAME" }
      ),
      new NoHeaderFilter(),
    ],
    [allProjectStatuses.edges]
  );

  return (
    <ExternalLayout session={session}>
      <header>
        <h2>Welcome</h2>
      </header>

      <Table
        paginated
        totalRowCount={allProjects.totalCount}
        filters={tableFilters}
        pageQuery={ExternalProjectsQuery}
      >
        {allProjects.edges.map(({ node }) => (
          <ProjectTableRow key={node.id} project={node} isInternal={false} />
        ))}
      </Table>

      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </ExternalLayout>
  );
}

export default withRelay(
  ExternalProjects,
  ExternalProjectsQuery,
  withRelayOptions
);
