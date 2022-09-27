import { render, screen } from "@testing-library/react";
import RankWidget from "lib/theme/widgets/RankWidget";

describe("The RankWidget", () => {
  it("renders the calculated value from the form context as specified in the uiSchema", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: 50 },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
        isMoney: true,
      },
    };
    render(<RankWidget {...props} />);
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("renders 0 if the calculated value is zero", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: 0 },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
    };
    render(<RankWidget {...props} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders a message if score isn't entered", () => {
    const props: any = {
      id: "test-id",
      formContext: { calculatedRank: null },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "calculatedRank",
      },
    };
    render(<RankWidget {...props} />);
    expect(
      screen.getByText(
        "Enter a project score to see the ranking compared to other scored projects."
      )
    ).toBeInTheDocument();
  });

  it("renders empty string if the calculated value is null", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: null },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
    };
    render(<RankWidget {...props} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
