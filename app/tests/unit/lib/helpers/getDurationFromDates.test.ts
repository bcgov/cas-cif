import getDurationFromDates from "lib/helpers/getDurationFromDates";

describe("The getDurationFromDates helper method", () => {
  it("returns the duration with the correct punctuation for singular values", () => {
    const startDate = "2022-08-11T23:59:59.999-07:00";
    const endDate = "2022-09-12T23:59:59.999-07:00";
    const duration = getDurationFromDates(startDate, endDate);

    expect(duration).toBe("1 month, 1 day");
  });

  it("returns the duration with the correct punctuation for plural values, and converts years to months", () => {
    const startDate = "2022-08-11T23:59:59.999-07:00";
    const endDate = "2023-09-14T23:59:59.999-07:00";
    const duration = getDurationFromDates(startDate, endDate);

    expect(duration).toBe("13 months, 3 days");
  });

  it("returns null when one or both dates have no value", () => {
    const startDate = "2022-08-9T23:59:59.999-07:00";
    const endDate = undefined;
    const duration = getDurationFromDates(startDate, endDate);

    expect(duration).toBe(null);
  });
});
