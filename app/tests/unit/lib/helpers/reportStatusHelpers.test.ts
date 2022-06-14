import {
  daysUntilReportDue,
  getReportingStatus,
  isOverdue,
} from "lib/helpers/reportStatusHelpers";
import { DateTime, Settings } from "luxon";

describe("The reportStatusHelpers", () => {
  it("daysUntilReportDue correctly calculates the number of days until a report is due", () => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
    const result = daysUntilReportDue("2020-01-30T00:00:00-07");
    expect(result).toEqual(10);
  });

  it("isOverdue returns true if the report is overdue", () => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
    const result = isOverdue("2019-01-30T00:00:00-07");
    expect(result).toEqual(true);
  });

  it("isOverdue returns false if the report is not overdue", () => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
    const result = isOverdue("2021-01-30T00:00:00-07");
    expect(result).toEqual(false);
  });
  it("getReportingStatus returns `onTrack` when reports are not overdue or complete", () => {
    const result = getReportingStatus([undefined], false);
    expect(result).toEqual("onTrack");
  });
  it("getReportingStatus returns `none` when no reports exist", () => {
    const result = getReportingStatus([], undefined);
    expect(result).toEqual("none");
  });
  it("getReportingStatus returns `complete` when all reports are complete", () => {
    const result = getReportingStatus(["2021-01-15T00:00:00-07"], false);
    expect(result).toEqual("complete");
  });
  it("getReportingStatus returns `late` when any report is late", () => {
    const result = getReportingStatus([undefined], true);
    expect(result).toEqual("late");
  });
});
