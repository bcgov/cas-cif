import { render, screen } from "@testing-library/react";
import ModalWidget from "lib/theme/widgets/ModalWidget";

describe("ModalWidget", () => {
  it("Displays an unchecked checkbox with label if there is a uiSchema.title", () => {
    const uiSchema = {
      title: "Scott Westerfield",
      pageRedirect: "Contacts",
    };
    render(<ModalWidget uiSchema={uiSchema} />);
    expect(screen.getByText(/scott westerfield/i)).toBeVisible();
    expect(screen.getByLabelText(/scott westerfield/i)).not.toBeChecked();
  });

  it("Displays a message if there is not a uiSchema.title", () => {
    const uiSchema = {
      pageRedirect: "Contacts",
    };
    render(<ModalWidget uiSchema={uiSchema} />);
    expect(
      screen.getByText(
        /Not added before. You can select one on the Project Details > Project Contacts page./i
      )
    ).toBeVisible();
  });

  it("Removes 'optional' if it appears in the uiSchema.title", () => {
    const uiSchema = {
      title: "Catherine Fisher (optional)",
      pageRedirect: "Managers",
    };
    render(<ModalWidget uiSchema={uiSchema} />);
    expect(screen.getByText(/Catherine Fisher/i)).toBeVisible();
    expect(screen.queryByText(/\(optional\)/i)).not.toBeInTheDocument();
  });
});
