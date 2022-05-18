import DueDateWidget from "lib/theme/widgets/DueDateWidget";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateTime } from "luxon";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import userEvent from "@testing-library/user-event";

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
    const startDate =
      DateTime.fromISO("2020-01-01").setZone("America/Vancouver");
    const expectedDate = "2050-12-15T23:59:59.999-08:00";
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Due date",
      value: startDate.toISO(),
      required: true,
    };
    render(<DueDateWidget id="widget-id" {...props} />);
    expect(screen.getByText(`Jan 1, 2020`)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Jan 1, 2020/i));
    userEvent.selectOptions(screen.getAllByRole("combobox")[0], "11");
    userEvent.selectOptions(screen.getAllByRole("combobox")[1], "2050");
    userEvent.click(
      screen.getByRole("option", {
        name: /choose thursday, december 15th, 2050/i,
      })
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
