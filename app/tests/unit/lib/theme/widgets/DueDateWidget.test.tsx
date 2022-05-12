import DueDateWidget from "lib/theme/widgets/DueDateWidget";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateTime } from "luxon";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";

describe("The DueDateWidget", () => {
  it("does not display a date when none is selected", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Due date",
      value: undefined,
      required: true,
    };
    render(<DueDateWidget {...props} />);
    expect(screen.getByText(/select a date/i)).toBeInTheDocument();
  });

  it("calls onChange with the correct date", () => {
    const currentDate = DateTime.now().setZone("America/Vancouver");
    const expectedDate = getTimestamptzFromDate(
      currentDate.plus({ days: 1 }),
      true
    );
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Due date",
      value: currentDate.toISO(),
      required: true,
    };
    render(<DueDateWidget id="widget-id" {...props} />);
    expect(
      screen.getByText(
        `Due in 0 days (${currentDate.toLocaleString(DateTime.DATE_MED)})`
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/due in 0 days/i));
    fireEvent.click(
      screen.getByRole("option", {
        selected: true,
      }).nextElementSibling
    );
    expect(handleOnChange).toHaveBeenCalledWith(expectedDate);
  });

  it("displays time difference in weeks when greater than 60 days", () => {
    const testDate = getTimestamptzFromDate(
      DateTime.now().plus({ years: 1 }),
      true
    );

    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Due date",
      value: testDate,
      required: true,
    };
    render(<DueDateWidget {...props} />);
    expect(screen.getByText(/due in 52 weeks/i)).toBeInTheDocument();
  });

  it("displays only the date if date selected is in the past", () => {
    const testDate = getTimestamptzFromDate(
      DateTime.fromISO("1999-01-01"),
      true
    );
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Due date",
      value: testDate,
      required: true,
    };
    render(<DueDateWidget {...props} />);
    expect(screen.getByText(/Jan 1, 1999/i)).toHaveTextContent("Jan 1, 1999");
  });
});
