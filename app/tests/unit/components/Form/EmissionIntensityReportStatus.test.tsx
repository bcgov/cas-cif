import { render, screen } from "@testing-library/react";
import { EmissionIntensityReportStatus } from "components/Form/EmissionIntensityReportStatus";
import { DateTime, Settings } from "luxon";

describe("The Emission Intensity Report Status", () => {
  afterEach(() => {
    // Reset the mocked system date
    Settings.now = () => Date.now();
  });
  it("Shows Late when current report's due date has passed", () => {
    const props: any = {
      reportDueDateString: "2020-01-10T00:00:00-08",
      emissionIntensityEndDateString: "2020-01-01T00:00:00-08",
    };

    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;

    render(<EmissionIntensityReportStatus {...props} />);
    expect(screen.getByText("Late")).toBeInTheDocument();
  });
  it("Shows Complete(MM DD YYYY) when the report's received date has entered", () => {
    const props: any = {
      submittedDateString: "2020-01-10T00:00:00-08",
    };
    render(<EmissionIntensityReportStatus {...props} />);
    expect(screen.getByText(/complete \(jan 10, 2020\)/i)).toBeInTheDocument();
  });
  it("Shows Not due when TEIMP end date has not reached", () => {
    const props: any = {
      emissionIntensityEndDateString: "2020-01-10T00:00:00-08",
    };
    const jan1st2020 = DateTime.local(2020, 1, 1, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan1st2020;

    render(<EmissionIntensityReportStatus {...props} />);
    expect(screen.getByText("Not due")).toBeInTheDocument();
  });
  it("Shows Due in xx days when TEIMP end date has reached and we have report due date less than 60 days", () => {
    const props: any = {
      reportDueDateString: "2020-01-10T00:00:00-08",
      emissionIntensityEndDateString: "2020-01-01T00:00:00-08",
    };
    const jan5th2020 = DateTime.local(2020, 1, 5, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan5th2020;

    render(<EmissionIntensityReportStatus {...props} />);
    expect(screen.getByText("Due in 5 days")).toBeInTheDocument();
  });
  it("Shows Due in xx weeks when TEIMP end date has reached and we have report due date more than 60 days", () => {
    const props: any = {
      reportDueDateString: "2020-03-06T00:00:00-08",
      emissionIntensityEndDateString: "2020-01-01T00:00:00-08",
    };
    const jan5th2020 = DateTime.local(2020, 1, 5, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan5th2020;

    render(<EmissionIntensityReportStatus {...props} />);
    expect(screen.getByText("Due in 8 weeks")).toBeInTheDocument();
  });
  it("Shows None when there is no information on the page", () => {
    render(<EmissionIntensityReportStatus />);
    expect(screen.getByText("None")).toBeInTheDocument();
  });
});
