import { screen } from "@testing-library/react";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTestQuery, {
  CollapsibleReportTestQuery,
  CollapsibleReportTestQuery$data,
} from "__generated__/CollapsibleReportTestQuery.graphql";

const testQuery = graphql`
  query CollapsibleReportTestQuery($reportingRequirement: ID!)
  @relay_test_operation {
    query {
      reportingRequirement(id: $reportingRequirement) {
        ...CollapsibleReport_reportingRequirement
      }
    }
  }
`;

const getPropsFromTestQuery = (data: CollapsibleReportTestQuery$data) => ({
  reportingRequirement: data.query.reportingRequirement,
});
const defaultComponentProps = {
  title: "Test Reporting Requirement",
};

const componentTestingHelper =
  new ComponentTestingHelper<CollapsibleReportTestQuery>({
    component: CollapsibleReport,
    compiledQuery: compiledTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: {},
    getPropsFromTestQuery,
    defaultComponentProps,
  });

describe("The Collapsible Report component", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("Displays the children when open", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(getPropsFromTestQuery, {
      ...defaultComponentProps,
      startOpen: true,
      children: <div>some report content</div>,
    });

    expect(screen.getByText(/Test Reporting Requirement/)).toBeInTheDocument();
    expect(screen.queryByText(/some report content/)).toBeInTheDocument();
  });

  it("Doesn't display the children when closed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(getPropsFromTestQuery, {
      ...defaultComponentProps,
      startOpen: false,
      children: <div>some report content</div>,
    });

    expect(screen.getByText(/Test Reporting Requirement/)).toBeInTheDocument();
    expect(screen.queryByText(/some report content/)).not.toBeInTheDocument();
  });

  it("Toggles the children when the header is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(getPropsFromTestQuery, {
      ...defaultComponentProps,
      startOpen: false,
      children: <div>some report content</div>,
    });

    screen.getByText(/Test Reporting Requirement/).click();
    expect(screen.queryByText(/some report content/)).toBeInTheDocument();
    screen.getByText(/Test Reporting Requirement/).click();
    expect(screen.queryByText(/some report content/)).not.toBeInTheDocument();
  });

  it("Shows 'Completed' when the report has a report due and a submitted date", () => {
    componentTestingHelper.loadQuery({
      ReportingRequirement() {
        return {
          reportDueDate: "2020-01-01T00:00:00-07",
          submittedDate: "1234-05-04T15:31:00-07",
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/Complete \(May 4, 1234\)/)).toBeInTheDocument();
  });

  it("Shows 'Late' when the report has a report due and no submitted date, and the date has passed", () => {
    componentTestingHelper.loadQuery({
      ReportingRequirement() {
        return {
          reportDueDate: "2020-01-01T00:00:00-07",
          submittedDate: null,
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/Late/)).toBeInTheDocument();
  });

  it("Shows 'On track' when the report has a report due and no submitted date, and the date has not yet passed", () => {
    componentTestingHelper.loadQuery({
      ReportingRequirement() {
        return {
          reportDueDate: "2099-01-01T00:00:00-07",
          submittedDate: null,
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/On track/)).toBeInTheDocument();
  });

  it("Shows no header badge if report due date is not set", () => {
    componentTestingHelper.loadQuery({
      ReportingRequirement() {
        return {
          reportDueDate: null,
          submittedDate: null,
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.queryByText(/On track/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Complete/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Late/)).not.toBeInTheDocument();
  });
});
