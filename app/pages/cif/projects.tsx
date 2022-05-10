import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import { useCreateProjectMutation } from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { getProjectRevisionOverviewFormPageRoute } from "pageRoutes";
import Table from "components/Table";
import ProjectTableRow from "components/Project/ProjectTableRow";
import {
  NoHeaderFilter,
  SortOnlyFilter,
  TextFilter,
  SearchableDropdownFilter,
} from "components/Table/Filters";
import { useMemo } from "react";

export const ProjectsQuery = graphql`
  query projectsQuery(
    $projectName: String
    $operatorTradeName: String
    $proposalReference: String
    $status: String
    $projectManagers: String
    $offset: Int
    $pageSize: Int
    $orderBy: [ProjectsOrderBy!]
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
        projectManagersByProjectId: {
          some: {
            cifUserByCifUserId: {
              fullName: { includesInsensitive: $projectManagers }
            }
          }
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
    allCifUsers {
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
        allProjectStatuses.edges.map((e) => e.node.name)
      ),
      new SearchableDropdownFilter(
        "Project Managers",
        "projectManagers",
        allCifUsers.edges.map((e) => e.node.fullName)
      ),
      new SortOnlyFilter("Funding Request", "totalFundingRequest"),
      new NoHeaderFilter(),
    ],
    [allCifUsers.edges, allProjects.edges]
  );

  const [createProject, isCreatingProject] = useCreateProjectMutation();

  const handleCreateProject = () => {
    createProject({
      variables: { input: {} },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionOverviewFormPageRoute(
            response.createProject.projectRevision.id
          )
        );
      },
    });
  };

  const handleResumeCreateProject = () => {
    router.push(
      getProjectRevisionOverviewFormPageRoute(pendingNewProjectRevision.id)
    );
  };

  const createOrResumeButton = pendingNewProjectRevision ? (
    <Button role="button" onClick={handleResumeCreateProject}>
      Resume Project Draft
    </Button>
  ) : (
    <Button
      role="button"
      onClick={handleCreateProject}
      disabled={isCreatingProject}
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
          <ProjectTableRow key={node.id} project={node} />
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
