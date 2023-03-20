import { screen } from "@testing-library/react";
import { ExternalProjectRevisionNew } from "pages/cif-external/project-revision/new";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledExternalNewProjectRevisionQuery, {
  newProjectRevisionExternalQuery,
} from "__generated__/newProjectRevisionExternalQuery.graphql";

const defaultMockResolver = {
  Query() {
    return {
      allFundingStreams: {
        edges: [
          {
            node: {
              rowId: 1,
              name: "EP",
              description: "Emissions Performance",
            },
          },
          {
            node: {
              rowId: 2,
              name: "IA",
              description: "Innovation Accelerator",
            },
          },
        ],
      },
      allFundingStreamRfps: {
        edges: [
          {
            node: {
              rowId: 1,
              year: 2019,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 2,
              year: 2020,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 3,
              year: 2021,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 4,
              year: 2022,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 5,
              year: 2021,
              fundingStreamId: 2,
            },
          },
          {
            node: {
              rowId: 6,
              year: 2022,
              fundingStreamId: 2,
            },
          },
        ],
      },
    };
  },
};

const pageTestingHelper =
  new PageTestingHelper<newProjectRevisionExternalQuery>({
    pageComponent: ExternalProjectRevisionNew,
    compiledQuery: compiledExternalNewProjectRevisionQuery,
    defaultQueryResolver: defaultMockResolver,
    defaultQueryVariables: {},
  });

describe("ProjectRevisionNew Page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("displays project rfp form", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(screen.getByText(/new project/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/select-parent-dropdown-root_fundingStreamRfpId/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();
  });
});
