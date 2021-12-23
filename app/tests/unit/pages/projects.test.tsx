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
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allProjects: {
        edges: [],
      },
      pendingNewProjectRevision: null,
    };
  },
};

const loadProjectsQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  const variables = {};
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
      <Projects CSN={true} preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The projects page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
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

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });
    loadProjectsQuery();
    renderProjects();
    userEvent.click(screen.getByText(/Add a Project/i));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
