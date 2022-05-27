import { screen } from "@testing-library/react";
import ReportStatusBadge from "components/ReportingRequirement/ReportStatusBadge";
import { Settings } from "luxon";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTestQuery, {
  ReportStatusBadgeQuery,
} from "__generated__/ReportStatusBadgeQuery.graphql";

const testQuery = graphql`
  query ReportStatusBadgeQuery($formChange: ID!) @relay_test_operation {
    query {
      formChange(id: $formChange) {
        ...ReportStatusBadge_formChange
      }
    }
  }
`;

const mockResolver = {
  FormChange() {
    return {
      id: "the-id-of-the-form-change",
      reportingRequirement: {
        reportDueDate: "2022-06-16",
      },
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<ReportStatusBadgeQuery>({
    component: ReportStatusBadge,
    compiledQuery: compiledTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockResolver,
    getPropsFromTestQuery: (data) => ({
      reportDueFormChange: data.query.formChange,
      reportTitle: "Test report",
    }),
  });

describe("The report status badge", () => {
  afterEach(() => {
    // Reset the mocked system date
    Settings.now = () => Date.now();
  });
  it("Displays the `On track` badge if the report is upcoming", () => {
    Settings.now = () => new Date("June 20, 2022").getTime();

    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("Displays the `Late` badge if the report is overdue", () => {
    Settings.now = () => new Date("June 01, 2022").getTime();

    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("On track")).toBeInTheDocument();
  });
});
