import { cleanup, render, screen } from "@testing-library/react";
import StatusBadge from "components/StatusBadge";

describe("The Status Badge", () => {
  it("displays the proper status when the variant is set", () => {
    render(<StatusBadge variant="complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
    cleanup();

    render(<StatusBadge variant="late" />);
    expect(screen.getByText("Late")).toBeInTheDocument();
    cleanup();

    render(<StatusBadge variant="onTrack" />);
    expect(screen.getByText("On track")).toBeInTheDocument();
    cleanup();

    render(<StatusBadge variant="none" />);
    expect(screen.getByText("None")).toBeInTheDocument();
    cleanup();

    render(<StatusBadge variant="inReview" />);
    expect(screen.getByText("In review")).toBeInTheDocument();
    cleanup();
  });

  it("displays the custom text when the variant is set to customText", () => {
    render(<StatusBadge variant="customText" label="Some Test Label" />);
    expect(screen.getByText("Some Test Label")).toBeInTheDocument();
  });

  it("doesnt display the optional label when the variant is not customText", () => {
    render(<StatusBadge variant="none" label="Some Test Label" />);
    expect(screen.queryByText("Some Test Label")).not.toBeInTheDocument();
  });
});
