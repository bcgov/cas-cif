import PageTestingHelper from "tests/helpers/pageTestingHelper";
import { ProjectRevisionView } from "pages/cif/project-revision/[projectRevision]/view";
import compiledViewProjectRevisionQuery, {
  viewProjectRevisionQuery,
} from "__generated__/viewProjectRevisionQuery.graphql";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getProjectRevisionChangeLogsPageRoute } from "routes/pageRoutes";
import projectFundingParameterEPSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";
import projectFundingParameterIASchema from "/schema/data/prod/json_schema/funding_parameter_IA.json";

const defaultMockResolver = {
  ProjectRevision(context, generateId) {
    return {
      id: `mock-proj-rev-${generateId()}`,
      revisionType: "General Revision",
      typeRowNumber: 1,
      changeReason: "Test comment",
    };
  },
  Query() {
    return {
      allRevisionTypes: {
        edges: [
          {
            node: {
              type: "General Revision",
            },
          },
          {
            node: {
              type: "Amendment",
            },
          },
        ],
      },
      epFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterEPSchema,
      },
      iaFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterIASchema,
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<viewProjectRevisionQuery>({
  pageComponent: ProjectRevisionView,
  compiledQuery: compiledViewProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: { projectRevision: "mock-id" },
});

describe("ProjectRevisionView Page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("displays project revision view page", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("heading", {
        name: /general revision 1/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/revision type/i)).toBeInTheDocument();
    expect(screen.getByText(/test comment/i)).toBeInTheDocument();
    expect(screen.queryByText(/Editing:/i)).not.toBeInTheDocument(); // tasklist should be in view mode
    expect(screen.queryByRole("input")).not.toBeInTheDocument(); // entire form should be read-only

    expect(
      screen.getByRole("checkbox", {
        name: /project overview/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Revision record history/i)).toBeInTheDocument();
  });

  it("Takes user to amendments and revisions table when they click Amendments & Other Revisions on the tasklist", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("button", {
        name: /amendments & other revisions/i,
      })
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", {
        name: /amendments & other revisions/i,
      })
    );
    // the `generateId` function runs for every node in the query. Here, the node containing `latestCommittedProjectRevision` is the third node in the query, so we look for id="mock-proj-rev-3"
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionChangeLogsPageRoute("mock-proj-rev-3")
    );
  });
});
