import { fireEvent, render, screen } from "@testing-library/react";
import ReportGenerator from "components/ReportingRequirement/ReportGenerator";
import { mocked } from "jest-mock";
import { useGenerateReports } from "mutations/ProjectReportingRequirement/generateReports";
jest.mock("mutations/ProjectReportingRequirement/generateReports");

const generateReports = jest.fn();
let isGenerating = false;
mocked(useGenerateReports).mockImplementation(() => [
  generateReports,
  isGenerating,
]);

describe("The ReportGenerator", () => {
  it("show dates and button to generate reports when required dates are provided", () => {
    const props: any = {
      revisionId: "test-revision-id",
      reportType: "Annual",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: "2021-01-01",
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: "2021-12-31",
      },
    };
    render(<ReportGenerator {...props} />);
    expect(screen.getByText(/start date/i)).toBeInTheDocument();
    expect(screen.getByText(/end date/i)).toBeInTheDocument();
    expect(screen.getByText(/jan[.]? 1, 2021/i)).toBeInTheDocument();
    expect(screen.getByText(/dec[.]? 31, 2021/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /generate annual reports/i,
      })
    ).toBeEnabled();
  });

  it("does not show dates and button to generate reports is disabled when required dates are not provided", () => {
    const props: any = {
      revisionId: "test-revision-id",
      reportType: "Annual",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: null,
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: null,
      },
    };
    render(<ReportGenerator {...props} />);
    expect(screen.getAllByText(/\-/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", {
        name: /generate annual reports/i,
      })
    ).toBeDisabled();
  });

  it("calls generateReportsMutation with the correct data", () => {
    const props: any = {
      revisionId: "test-revision-id",
      reportType: "Quarterly",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: "2021-01-01",
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: "2021-12-31",
      },
    };
    render(<ReportGenerator {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /generate quarterly reports/i,
      })
    );
    expect(generateReports).toHaveBeenCalledWith({
      variables: {
        input: {
          revisionId: "test-revision-id",
          reportType: "Quarterly",
          startDate: "2021-01-01",
          endDate: "2021-12-31",
        },
      },
    });
  });
});
