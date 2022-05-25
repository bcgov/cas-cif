import { screen } from "@testing-library/react";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import { Settings } from "luxon";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTestQuery, {
  ReportDueIndicatorQuery,
} from "__generated__/ReportDueIndicatorQuery.graphql";

const testQuery = graphql`
  query ReportDueIndicatorQuery($formChange: ID!) @relay_test_operation {
    query {
      formChange(id: $formChange) {
        ...ReportDueIndicator_formChange
      }
    }
  }
`;

const mockResolver = {
  FormChange() {
    return {
      id: "the-id-of-the-form-change",
      reportingRequirement: {
        reportDueDate: "2020-01-10",
        reportingRequirementIndex: 3,
      },
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<ReportDueIndicatorQuery>({
    component: ReportDueIndicator,
    compiledQuery: compiledTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockResolver,
    getPropsFromTestQuery: (data) => ({
      reportDueFormChange: data.query.formChange,
      reportTitle: "Test report",
    }),
  });

describe("The report due indicator", () => {
  afterEach(() => {
    // Reset the mocked system date
    Settings.now = () => Date.now();
  });
  it("Displays the remaining days to the next report due date if the report is upcoming", () => {
    Settings.now = () => new Date("January 20, 2020").getTime();

    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // Group role grabs the fieldset
    expect(screen.getByRole("group")).toHaveTextContent(
      /Overdue by 10 day\(s\)/
    );
  });

  it("Displays the number of days overdue if the report is overdue", () => {
    Settings.now = () => new Date("January 08, 2020").getTime();

    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // Group role grabs the fieldset
    expect(screen.getByRole("group")).toHaveTextContent(/Due in 2 day\(s\)/);
  });

  it("Displays a 'no report due' message if the form_change is null", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(() => ({
      reportDueFormChange: undefined,
    }));

    // Group role grabs the fieldset
    expect(screen.getByRole("group")).toHaveTextContent(/-/);
  });

  it("Shows an anchor link to the form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // Group role grabs the fieldset
    expect(screen.getByText("Test report 3").closest("a")).toHaveAttribute(
      "href",
      "/#form-the-id-of-the-form-change"
    );
  });
});
