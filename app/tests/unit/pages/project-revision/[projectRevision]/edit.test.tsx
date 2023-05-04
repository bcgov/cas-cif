import PageTestingHelper from "tests/helpers/pageTestingHelper";
import { ProjectRevisionEdit } from "pages/cif/project-revision/[projectRevision]/edit";
import compiledEditProjectRevisionQuery, {
  editProjectRevisionQuery,
} from "__generated__/editProjectRevisionQuery.graphql";
import { screen } from "@testing-library/react";
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

const pageTestingHelper = new PageTestingHelper<editProjectRevisionQuery>({
  pageComponent: ProjectRevisionEdit,
  compiledQuery: compiledEditProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: { projectRevision: "mock-id" },
});

describe("ProjectRevisionEdit Page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("displays project revision edit page", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("heading", {
        name: /general revision 1/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/revision type/i)).toBeInTheDocument();
    expect(screen.getByText(/test comment/i)).toBeInTheDocument();
    expect(screen.queryByText(/Editing:/i)).toBeInTheDocument(); // tasklist should be in edit mode

    // revision type is immutable
    expect(screen.getByDisplayValue("Amendment")).toBeDisabled();
    expect(screen.getByDisplayValue("General Revision")).toBeDisabled();

    expect(
      screen.getByRole("checkbox", {
        name: /project overview/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Revision record history/i)).toBeInTheDocument();
  });
});
