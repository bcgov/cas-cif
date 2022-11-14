import { fireEvent, render, screen } from "@testing-library/react";
import ReportGenerator from "components/ReportingRequirement/ReportGenerator";
import { mocked } from "jest-mock";
import { useGenerateAnnualReports } from "mutations/ProjectReportingRequirement/generateAnnualReports";
import { useGenerateQuarterlyReports } from "mutations/ProjectReportingRequirement/generateQuarterlyReports";
jest.mock("mutations/ProjectReportingRequirement/generateAnnualReports");
jest.mock("mutations/ProjectReportingRequirement/generateQuarterlyReports");

let isGenerating = false;

describe("The ReportGenerator", () => {
  it("show dates and button to generate reports when required dates are provided", () => {
    const props: any = {
      revisionId: "test-revision-id",
      reportType: "Annual",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: "2021-01-01T23:59:59.999-07:00",
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: "2021-12-31T23:59:59.999-07:00",
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

  it("calls generateQuarterlyReportsMutation with the correct data for Quarterly Reports", () => {
    const generateQuarterlyReportsMutation = jest.fn();
    mocked(useGenerateQuarterlyReports).mockImplementation(() => [
      generateQuarterlyReportsMutation,
      isGenerating,
    ]);
    const props: any = {
      revisionId: "test-revision-id",
      reportType: "Quarterly",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: "2021-01-01T23:59:59.999-07:00",
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: "2021-12-31T23:59:59.999-07:00",
      },
      mutationFunction: generateQuarterlyReportsMutation,
      isGenerating: isGenerating,
    };
    render(<ReportGenerator {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /generate quarterly reports/i,
      })
    );
    expect(generateQuarterlyReportsMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          revisionId: "test-revision-id",
          startDate: "2021-01-01T23:59:59.999-07:00",
          endDate: "2021-12-31T23:59:59.999-07:00",
        },
      },
    });
  });
  it("calls generateAnnualReportsMutation with the correct data for Annual Reports", () => {
    const generateAnnualReportsMutation = jest.fn();
    mocked(useGenerateAnnualReports).mockImplementation(() => [
      generateAnnualReportsMutation,
      isGenerating,
    ]);
    const props: any = {
      revisionId: "test-revision-id-2",
      reportType: "Annual",
      startDateObject: {
        id: "start-date-id",
        label: "Start Date",
        inputName: "startDate",
        date: "2021-01-01T23:59:59.999-07:00",
      },
      endDateObject: {
        id: "end-date-id",
        label: "End Date",
        inputName: "endDate",
        date: "2021-12-31T23:59:59.999-07:00",
      },
      mutationFunction: generateAnnualReportsMutation,
      isGenerating: isGenerating,
    };
    render(<ReportGenerator {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /generate annual reports/i,
      })
    );
    expect(generateAnnualReportsMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          revisionId: "test-revision-id-2",
          startDate: "2021-01-01T23:59:59.999-07:00",
          endDate: "2021-12-31T23:59:59.999-07:00",
        },
      },
    });
  });
});
