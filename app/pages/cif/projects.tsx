import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import commitProjectMutation from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { getProjectRevisionOverviewFormPageRoute } from "pageRoutes";
import Table from "components/Table";
import ProjectTableRow from "components/Project/ProjectTableRow";
import {
  DisplayOnlyFilter,
  NoHeaderFilter,
  SortOnlyFilter,
  TextFilter,
} from "components/Table/Filters";

export const ProjectsQuery = graphql`
  query projectsQuery(
    $projectName: String
    $operatorTradeName: String
    $proposalReference: String
    $status: String
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
  }
`;

const tableFilters = [
  new TextFilter("Project Name", "projectName"),
  new TextFilter("Operator Trade Name", "operatorTradeName", {
    orderByPrefix: "OPERATOR_BY_OPERATOR_ID__TRADE_NAME",
  }),
  new TextFilter("Proposal Reference", "proposalReference"),
  new TextFilter("Status", "status", {
    orderByPrefix: "PROJECT_STATUS_BY_PROJECT_STATUS_ID__NAME",
  }),
  new DisplayOnlyFilter("Assigned To"),
  new SortOnlyFilter("Funding Request", "totalFundingRequest"),
  new NoHeaderFilter(),
];

export function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const router = useRouter();

  const { allProjects, pendingNewProjectRevision, session } = usePreloadedQuery(
    ProjectsQuery,
    preloadedQuery
  );
  const createDraftProject = async () => {
    const response = await commitProjectMutation(preloadedQuery.environment, {
      input: {},
    });
    await router.push(
      getProjectRevisionOverviewFormPageRoute(
        response.createProject.projectRevision.id
      )
    );
  };

  const resumeStagedProject = async () => {
    await router.push(
      getProjectRevisionOverviewFormPageRoute(pendingNewProjectRevision.id)
    );
  };

  const createOrResumeButton = pendingNewProjectRevision ? (
    <Button role="button" onClick={resumeStagedProject}>
      Resume Project Draft
    </Button>
  ) : (
    <Button role="button" onClick={createDraftProject}>
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
