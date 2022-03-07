import React from "react";
import {
  ProjectOverview,
  pageQuery,
} from "../../../pages/cif/project/[project]/index";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import {
  ProjectOverwiewQuery,
  ProjectOverwiewQuery$variables,
} from "__generated__/ProjectOverwiewQuery.graphql";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
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
      project: {
        projectName: "Project 1",
        rfpNumber: "12345",
        totalFundingRequest: "1.00",
        summary: "Summary 1",
        operatorByOperatorId: {
          legalName: "Operator 1 legal name",
          bcRegistryId: "BC7654231",
          tradeName: "Operator 1 trade name",
        },
        fundingStreamRfpByFundingStreamRfpId: {
          year: 2022,
          fundingStreamByFundingStreamId: {
            description: "Emissions Performance",
          },
        },
        projectStatusByProjectStatusId: {
          name: "Technical Review",
        },
        contactsByProjectContactProjectIdAndContactId: {
          edges: [
            {
              node: {
                id: "1",
                familyName: "Contact family name 1",
                givenName: "Contact given name 1",
              },
            },
            {
              node: {
                id: "2",
                familyName: "Contact family name 2",
                givenName: "Contact given name 2",
              },
            },
            {
              node: {
                id: "3",
                familyName: "Contact family name 3",
                givenName: "Contact given name 3",
              },
            },
          ],
        },
        projectManagersByProjectId: {
          edges: [
            {
              node: {
                cifUserByCifUserId: {
                  firstName: "Manager first name 1",
                  lastName: "Manager last name 1",
                  id: "1",
                },
              },
            },
            {
                node: {
                  cifUserByCifUserId: {
                    firstName: "Manager first name 2",
                    lastName: "Manager last name 2",
                    id: "2",
                  },
                },
              },
          ],
        },
      },
    };
  },
};

const loadProjectOverwiewQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: ProjectOverwiewQuery$variables = {
    project: null,
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(pageQuery, variables);
  initialQueryRef = loadQuery<ProjectOverwiewQuery>(
    environment,
    pageQuery,
    variables
  );
};

const renderProjectDetails = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <ProjectOverview CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The project details page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders the project details", () => {
    loadProjectOverwiewQuery();
    renderProjectDetails();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Summary 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/BC7654231/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 trade name/i)).toBeInTheDocument();
    expect(screen.getByText(/2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Emissions Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact family name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact given name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact family name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact given name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact family name 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact given name 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 2/i)).toBeInTheDocument();
  });
});
