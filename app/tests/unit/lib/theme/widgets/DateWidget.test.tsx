import DateWidget from "lib/theme/widgets/DateWidget";
import { render, screen, fireEvent } from "@testing-library/react";
// import { DateTime } from "luxon";
// import getTimestamptzFromDate from "lib/helpers/getTimestamptzFromDate";
import userEvent from "@testing-library/user-event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

describe("The DateWidget", () => {
  it("does not display a date when none is selected and there is no due date", () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Received Date",
      value: undefined,
      required: true,
      formContext: null,
    };
    render(<DateWidget {...props} />);
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
    render(<DateWidget id="widget-id" {...props} />);
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
      uiSchema: {
        contentPrefix: (
          <div>
            <span style={{ marginRight: "1em" }}>Received</span>
            <FontAwesomeIcon icon={faCheck} color={"green"} />
          </div>
        ),
      },
    };
    const { container } = render(<DateWidget {...props} />);

    expect(screen.getByLabelText(/received date/i)).toHaveTextContent(
      /Jan[.]? 01, 2009/
    );
    expect(container.getElementsByClassName("fa-check")[0]).toBeInTheDocument();
  });
});
