import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectRevisionNew } from "pages/cif/project-revision/new";
import { MockPayloadGenerator } from "relay-test-utils";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledNewProjectRevisionQuery, {
  newProjectRevisionQuery,
} from "__generated__/newProjectRevisionQuery.graphql";

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

const pageTestingHelper = new PageTestingHelper<newProjectRevisionQuery>({
  pageComponent: ProjectRevisionNew,
  compiledQuery: compiledNewProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {},
});

describe("ProjectRevisionNew Page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("displays project revision new page", () => {
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

  it("Triggers the createProject mutation and redirects when the user clicks the Confirm button", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByLabelText(/select-parent-dropdown-root_fundingStreamRfpId/i)
    ).toBeInTheDocument();

    userEvent.selectOptions(
      screen.getByLabelText(/select-parent-dropdown-root_fundingStreamRfpId/i),
      ["Emissions Performance"]
    );
    userEvent.selectOptions(
      screen.getByLabelText(
        "select-child-dropdown-root_fundingStreamRfpId-select"
      ),
      ["2019"]
    );
    userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    pageTestingHelper.expectMutationToBeCalled("createProjectMutation", {
      input: {
        fundingStreamRpfId: 1,
      },
    });
    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    act(() => {
      pageTestingHelper.environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        projectRevision: "<ProjectRevision-mock-id-1>",
        formIndex: 0,
        isRoutedFromNew: true,
      },
      anchor: undefined,
    });
  });

  it("Triggers an error if the confirm button is clicked and the form is incomplete", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(screen.getByText(/Please enter a value/i)).toBeInTheDocument();
  });
});
