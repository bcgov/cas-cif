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
      revisionType: "Minor Revision",
      typeRowNumber: 1,
      changeReason: "Test comment",
      createdAt: "2021-01-01T23:59:59.999-07:00",
      cifUserByCreatedBy: { fullName: "test-user-1" },
      updatedAt: "2021-02-01T23:59:59.999-07:00",
      cifUserByUpdatedBy: { fullName: "test-user-2" },
    };
  },
  Query() {
    return {
      allRevisionTypes: {
        edges: [
          {
            node: {
              type: "Minor Revision",
            },
          },
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
        name: /minor revision 1/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/revision type/i)).toBeInTheDocument();
    expect(screen.getByText(/test comment/i)).toBeInTheDocument();
    expect(screen.getByText(/test-user-2/i)).toBeInTheDocument();
    expect(screen.getByText(/Feb[.]? 1, 2021/i)).toBeInTheDocument();
    expect(screen.getByText(/test-user-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2021/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending actions from/i)).toBeInTheDocument();
    expect(screen.getByText(/forms updated/i)).toBeInTheDocument();

    expect(
      screen.getByRole("checkbox", {
        name: /project overview/i,
      })
    ).toBeInTheDocument();
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
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionChangeLogsPageRoute("mock-proj-rev-8")
    );
  });
});
