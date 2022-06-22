import { render, screen } from "@testing-library/react";
import {
  getBadgeForIndividualReportStatus,
  getBadgeForOverallReportStatus,
  getDaysUntilDue,
} from "lib/helpers/reportStatusHelpers";
import { DateTime, Settings } from "luxon";

describe("The reportStatusHelpers", () => {
  beforeEach(() => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
  });

  it("getDaysUntilReportDue correctly calculates the number of days until a report is due when it is upcoming", () => {
    const jan21st2020 = DateTime.local(2020, 1, 21, {
      zone: "America/Vancouver",
    });
    const result = getDaysUntilDue(jan21st2020);
    expect(result).toEqual(1);
  });

  it("getDaysUntilReportDue correctly calculates the number of days until a report is due when it is late", () => {
    const jan19th2020 = DateTime.local(2020, 1, 19, {
      zone: "America/Vancouver",
    });
    const result = getDaysUntilDue(jan19th2020);
    expect(result).toEqual(-1);
  });

  it("getBadgeForOverallReportStatus returns `onTrack` badge when reports are not overdue or complete", () => {
    render(getBadgeForOverallReportStatus("2020-01-21", [undefined]));
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("getBadgeForOverallReportStatus returns `none` badge when no reports exist", () => {
    render(getBadgeForOverallReportStatus(undefined, []));
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("getBadgeForOverallReportStatus returns `complete` badge when all reports are complete", () => {
    render(getBadgeForOverallReportStatus("2020-01-31", ["2020-01-31"]));
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("getBadgeForOverallReportStatus returns `late` badge when any report is late", () => {
    render(getBadgeForOverallReportStatus("2020-01-19", [undefined]));
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("getBadgeForIndividualReportStatus returns `onTrack` badge when reports are not overdue or complete", () => {
    render(getBadgeForIndividualReportStatus("2020-01-21", null));
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("getBadgeForIndividualReportStatus returns `complete` badge when all reports are complete", () => {
    render(getBadgeForIndividualReportStatus("2020-01-31", "2020-01-31"));
    expect(screen.getByText(/Jan[.]? 31, 2020/)).toBeInTheDocument();
  });

  it("getBadgeForIndividualReportStatus returns `late` badge when any report is late", () => {
    render(getBadgeForIndividualReportStatus("2020-01-19", null));
    expect(screen.getByText("Late")).toBeInTheDocument();
  });
});
