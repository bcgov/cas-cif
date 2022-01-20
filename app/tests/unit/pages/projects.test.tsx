import React from "react";
import { Projects, ProjectsQuery } from "../../../pages/cif/projects";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import {
  projectsQuery,
  projectsQuery$variables,
} from "__generated__/projectsQuery.graphql";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allProjects: {
        totalCount: 2,
        edges: [
          { node: { id: "1", projectName: "Project 1" } },
          { node: { id: "2", projectName: "Project 2" } },
        ],
      },
      pendingNewProjectRevision: null,
    };
  },
};

const loadProjectsQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: projectsQuery$variables = {
    projectName: null,
    operatorTradeName: null,
    rfpNumber: null,
    status: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(ProjectsQuery, variables);
  initialQueryRef = loadQuery<projectsQuery>(
    environment,
    ProjectsQuery,
    variables
  );
};

const renderProjects = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Projects CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The projects page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders the list of projects", () => {
    loadProjectsQuery();
    renderProjects();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Project 2/i)).toBeInTheDocument();
  });

  it("loads the Add a Project Button", () => {
    loadProjectsQuery();
    renderProjects();

    expect(screen.getByText(/Add a Project/i)).toBeInTheDocument();
  });

  it("renders the Resume Project Draft button if a draft exists", () => {
    loadProjectsQuery({
      Query() {
        return {
          session: { cifUserBySub: {} },
          allProjects: {
            totalCount: 0,
            edges: [],
          },
          pendingNewProjectRevision: {
            id: "123",
          },
        };
      },
    });
    renderProjects();

    expect(screen.getByText(/resume project draft/i)).toBeInTheDocument();
    expect(screen.queryByText(/add a project/i)).toBeNull();
  });

  it("calls the Add a Project mutation when the Add a Project Button is clicked", () => {
    const spy = jest
      .spyOn(require("mutations/Project/createProject"), "default")
      .mockImplementation(() => {
        return {
          createProject: {
            projectRevision: {
              id: "someid",
            },
          },
        };
      });

    loadProjectsQuery();
    renderProjects();
    userEvent.click(screen.getByText(/Add a Project/i));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
