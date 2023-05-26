import Button from "@button-inc/bcgov-theme/Button";
import DefaultLayout from "components/Layout/DefaultLayout";
import ProjectTableRow from "components/Project/ProjectTableRow";
import Table from "components/Table";
import {
  NoHeaderFilter,
  SearchableDropdownFilter,
  SortOnlyFilter,
  TextFilter,
} from "components/Table/Filters";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import {
  getNewProjectRevisionPageRoute,
  getProjectRevisionFormPageRoute,
} from "routes/pageRoutes";
import { projectsQuery } from "__generated__/projectsQuery.graphql";

export const ProjectsQuery = graphql`
  query projectsQuery(
    $projectName: String
    $operatorTradeName: String
    $proposalReference: String
    $status: String
    $primaryProjectManager: String
    $offset: Int
    $pageSize: Int
    $orderBy: [ProjectsOrderBy!]
    $nextMilestoneDueDate: DatetimeFilter
  ) {
    session {
      ...DefaultLayout_session
    }

    pendingNewProjectRevision {
      id
    }

    allProjects(
      first: $pageSize
      offset: $offset
      filter: {
        projectName: { includesInsensitive: $projectName }
        operatorByOperatorId: {
          tradeName: { includesInsensitive: $operatorTradeName }
        }
        proposalReference: { includesInsensitive: $proposalReference }
        projectStatusByProjectStatusId: {
          name: { includesInsensitive: $status }
        }
        primaryManagers: { includesInsensitive: $primaryProjectManager }
        nextMilestoneDueDate: $nextMilestoneDueDate
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
    allCifUsers(
      filter: {
        projectManagersByCifUserId: {
          some: {
            projectManagerLabelByProjectManagerLabelId: {
              label: { includesInsensitive: "primary" }
            }
          }
        }
      }
    ) {
      edges {
        node {
          fullName
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

export function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const {
    allProjects,
    allCifUsers,
    allProjectStatuses,
    pendingNewProjectRevision,
    session,
  } = usePreloadedQuery(ProjectsQuery, preloadedQuery);
  const router = useRouter();
  const tableFilters = useMemo(
    () => [
      new TextFilter("Project Name", "projectName"),
      new TextFilter("Operator Trade Name", "operatorTradeName", {
        orderByPrefix: "OPERATOR_BY_OPERATOR_ID__TRADE_NAME",
      }),
      new TextFilter("Proposal Reference", "proposalReference"),
      new SearchableDropdownFilter(
        "Status",
        "status",
        allProjectStatuses.edges.map((e) => e.node.name),
        { orderByPrefix: "PROJECT_STATUS_BY_PROJECT_STATUS_ID__NAME" }
      ),
      new SortOnlyFilter("Milestone Due", "nextMilestoneDueDate"),
      new SearchableDropdownFilter(
        "Primary Project Managers",
        "primaryProjectManager",
        allCifUsers.edges.map((e) => e.node.fullName),
        { sortable: false }
      ),
      new SortOnlyFilter("Funding Request", "totalFundingRequest"),
      new NoHeaderFilter(),
    ],
    [allCifUsers.edges, allProjectStatuses.edges]
  );

  const handleResumeCreateProject = () => {
    router.push(
      getProjectRevisionFormPageRoute(pendingNewProjectRevision.id, 0)
    );
  };

  const createOrResumeButton = pendingNewProjectRevision ? (
    <Button role="button" onClick={handleResumeCreateProject}>
      Resume Project Draft
    </Button>
  ) : (
    <Button
      role="button"
      onClick={() => router.push(getNewProjectRevisionPageRoute())}
    >
      Add a Project
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>CIF Projects</h2>
        <section>
          <p>Please note: there is a maximum of one draft project at a time.</p>
          {createOrResumeButton}
        </section>
      </header>

      <Table
        paginated
        totalRowCount={allProjects.totalCount}
        filters={tableFilters}
        pageQuery={ProjectsQuery}
      >
        {allProjects.edges.map(({ node }) => (
          <ProjectTableRow key={node.id} project={node} isInternal={true} />
        ))}
      </Table>

      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(Projects, ProjectsQuery, withRelayOptions);
