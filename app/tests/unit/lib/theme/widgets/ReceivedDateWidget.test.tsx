import ReceivedDateWidget from "lib/theme/widgets/ReceivedDateWidget";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateTime } from "luxon";
import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import userEvent from "@testing-library/user-event";

describe("The ReceivedDateWidget", () => {
  it("does not display a date when none is selected and there is no due date", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Received Date",
      value: undefined,
      required: true,
      formContext: null,
    };
    render(<ReceivedDateWidget {...props} />);
    expect(screen.getByText(/select a date/i)).toBeInTheDocument();
  });

  it("calls onChange with the correct date", () => {
    const expectedDate = "2050-12-15T23:59:59.999-08:00";
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Received Date",
      value: "2020-01-01T23:59:59.999-07:00",
      required: true,
    };
    render(<ReceivedDateWidget id="widget-id" {...props} />);
    expect(screen.getByText(/Jan[.]? 01, 2020/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/received date/i));
    userEvent.selectOptions(screen.getAllByRole("combobox")[0], "11");
    userEvent.selectOptions(screen.getAllByRole("combobox")[1], "2050");
    userEvent.click(
      screen.getByRole("option", {
        name: /choose thursday, december 15th, 2050/i,
      })
    );
    expect(handleOnChange).toHaveBeenCalledWith(expectedDate);
  });

  it("if report is upcoming, displays weeks until due", () => {
    const dueDate = getTimestamptzFromDate(
      DateTime.now().setZone("America/Vancouver").plus({ years: 1 }),
      true
    );

    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Received Date",
      formContext: {
        dueDate,
      },
      value: undefined,
      required: true,
    };
    render(<ReceivedDateWidget {...props} />);
    expect(screen.getByText(/Select a date/i)).toBeInTheDocument();
  });

  it("displays overdue text and icon if report is late", () => {
    const dueDate = getTimestamptzFromDate(
      DateTime.now().setZone("America/Vancouver").minus({ days: 5 }),
      true
    );
    const handleOnChange = jest.fn();
    const props: any = {
      id: "test-id",
      onChange: handleOnChange,
      label: "Received Date",
      value: undefined,
      formContext: {
        dueDate,
      },
      required: true,
    };
    const { container } = render(
      <ReceivedDateWidget id="widget-id" {...props} />
    );
    expect(screen.getByLabelText(/received date/i)).toHaveTextContent(
      /Select a date/
    );
    expect(
      container.getElementsByClassName("fa-exclamation-circle")[0]
    ).toBeUndefined();
  });

  it("displays received text and icon if report is received", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Received Date",
      value: "2009-01-01T23:59:59.999-08:00",
      required: true,
      formContext: {
        dueDate: "2010-12-15T23:59:59.999-08:00",
      },
    };
    const { container } = render(<ReceivedDateWidget {...props} />);

    expect(screen.getByLabelText(/received date/i)).toHaveTextContent(
      /Jan[.]? 01, 2009/
    );
    expect(container.getElementsByClassName("fa-check")[0]).toBeInTheDocument();
  });
});
