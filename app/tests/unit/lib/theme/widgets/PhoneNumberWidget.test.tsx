import PhoneNumberWidget from "lib/theme/widgets/PhoneNumberWidget";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("PhoneNumberWidget", () => {
  it("Displays a mask when empty", () => {
    render(
      <PhoneNumberWidget
        id="test-phone"
        schema={{ title: "test phone", type: "string" }}
        label="test phone"
      />
    );
    expect(screen.getByLabelText(/test phone/i)).toHaveValue("(___) ___-____");
  });

  it("accepts a value in E.164 format", () => {
    render(
      <PhoneNumberWidget
        id="test-phone"
        schema={{ title: "test phone", type: "string" }}
        label="test phone"
        value="+12501234567"
      />
    );
    expect(screen.getByLabelText(/test phone/i)).toHaveValue("(250) 123-4567");
  });

  it("returns a value in E.164 format", () => {
    const onChange = jest.fn();
    render(
      <PhoneNumberWidget
        id="test-phone"
        schema={{ title: "test phone", type: "string" }}
        label="test phone"
        onChange={onChange}
      />
    );

    userEvent.type(screen.getByLabelText(/test phone/i), "2501234567");
    expect(screen.getByLabelText(/test phone/i)).toHaveValue("(250) 123-4567");
    expect(onChange).toHaveBeenCalledWith("+12501234567");
  });
});
