import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import { useCreateProjectMutation } from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import Table from "components/Table";
import ProjectTableRow from "components/Project/ProjectTableRow";
import {
  NoHeaderFilter,
  SortOnlyFilter,
  TextFilter,
  SearchableDropdownFilter,
  DisplayOnlyFilter,
} from "components/Table/Filters";
import { useMemo } from "react";

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
            and: {
              cifUserByCifUserId: {
                fullName: { includesInsensitive: $primaryProjectManager }
              }
              projectManagerLabelByProjectManagerLabelId: {
                label: { includesInsensitive: "primary" }
              }
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
      new DisplayOnlyFilter("Milestone Due"),
      new SearchableDropdownFilter(
        "Primary Project Managers",
        "primaryProjectManager",
        allCifUsers.edges.map((e) => e.node.fullName),
        { allowFreeFormInput: true, sortable: false }
      ),
      new SortOnlyFilter("Funding Request", "totalFundingRequest"),
      new NoHeaderFilter(),
    ],
    [allCifUsers.edges, allProjectStatuses.edges]
  );

  const [createProject, isCreatingProject] = useCreateProjectMutation();

  const handleCreateProject = () => {
    createProject({
      variables: { input: {} },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProject.projectRevision.id,
            0
          )
        );
      },
    });
  };

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
