import DueDateWidget from "lib/theme/widgets/DueDateWidget";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import userEvent from "@testing-library/user-event";

describe("The DueDateWidget", () => {
  it("does not display a date when none is selected", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Report Due Date",
      value: undefined,
      required: true,
    };
    render(<DueDateWidget {...props} />);
    expect(screen.getByText(/select a date/i)).toBeInTheDocument();
  });

  it("calls onChange with the correct date", () => {
    const expectedDate = "2050-12-15T23:59:59.999-08:00";
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Report Due Date",
      value: "2020-01-01T23:59:59.999-07:00",
      required: true,
    };
    render(<DueDateWidget id="widget-id" {...props} />);
    expect(screen.getByText(/jan[.]? 01, 2020/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/report due date/i));
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
      DateTime.now().setZone("America/Vancouver").plus({ years: 1 }),
      true
    );

    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Report Due Date",
      value: testDate,
      required: true,
    };
    render(<DueDateWidget {...props} />);
    expect(screen.getByText(/due in 52 weeks/i)).toBeInTheDocument();
  });

  it("displays only the date if date selected is in the past", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Report Due Date",
      value: "1999-01-01T23:59:59.999-07:00",
      required: true,
    };
    render(<DueDateWidget {...props} />);
    // the date is formatted using locale and it can show up slightly differently in different browsers (e.g., sometimes there's a period after the month abbreviation, sometimes there's not)
    expect(screen.getByLabelText(/report due date/i)).toHaveTextContent(
      /Jan[.]? 01, 1999/
    );
  });

  it("saves the date in PST when user is in another timezone", () => {
    Settings.defaultZone = "America/Edmonton";
    const expectedDate = "2050-12-15T23:59:59.999-08:00";
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Report Due Date",
      value: "2020-01-01T23:59:59.999-07:00",
      required: true,
    };
    render(<DueDateWidget id="widget-id" {...props} />);
    expect(screen.getByText(/jan[.]? 01, 2020/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/report due date/i));
    userEvent.selectOptions(screen.getAllByRole("combobox")[0], "11");
    userEvent.selectOptions(screen.getAllByRole("combobox")[1], "2050");
    userEvent.click(
      screen.getByRole("option", {
        name: /choose thursday, december 15th, 2050/i,
      })
    );
    expect(handleOnChange).toHaveBeenCalledWith(expectedDate);
    Settings.defaultZone = "America/Vancouver";
  });

  it("succesfully clears the date", () => {
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Report Due Date",
      value: "2020-01-01T23:59:59.999-07:00",
      required: true,
    };
    render(<DueDateWidget id="widget-id" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(handleOnChange).toHaveBeenCalledWith(null);
  });
});
