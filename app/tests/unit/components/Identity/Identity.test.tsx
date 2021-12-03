import { render, screen } from "@testing-library/react";
import Identity from "components/Identity/Identity";
import { mockRandom } from "jest-mock-random";
import { Identity_query } from "__generated__/Identity_query.graphql";

beforeEach(() => {
  mockRandom([0.3, 0.1, 0.4, 0.1, 0.5, 0.9]);
});

describe("The Identity component", () => {
  it("matches the snapshot", () => {
    const queryData: Identity_query = {
      query: {
        allOperators: {
          edges: [
            {
              node: {
                id: "abc",
                rowId: 1,
                legalName: "Test Operator LEGAL",
                tradeName: "Test Operator TRADE",
                bcRegistryId: "123456789",
              },
            },
            {
              node: {
                id: "def",
                rowId: 2,
                legalName: "Second Test Operator LEGAL",
                tradeName: "Second Test Operator TRADE",
                bcRegistryId: "987654321",
              },
            },
          ],
        },
      },
      " $refType": "Identity_query",
    };

    jest
      .spyOn(require("react-relay"), "useFragment")
      .mockImplementation(() => queryData);

    const componentUnderTest = render(
      <Identity query={null} applyChange={() => null} formChangeData={{}} />
    );

    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("renders n options for n edges in allOperators", () => {
    const queryData: Identity_query = {
      query: {
        allOperators: {
          edges: [
            {
              node: {
                id: "abc",
                rowId: 1,
                legalName: "Test Operator LEGAL",
                tradeName: "Test Operator TRADE",
                bcRegistryId: "123456789",
              },
            },
            {
              node: {
                id: "def",
                rowId: 2,
                legalName: "Second Test Operator LEGAL",
                tradeName: "Second Test Operator TRADE",
                bcRegistryId: "987654321",
              },
            },
          ],
        },
      },
      " $refType": "Identity_query",
    };

    jest
      .spyOn(require("react-relay"), "useFragment")
      .mockImplementation(() => queryData);

    render(
      <Identity query={null} applyChange={() => null} formChangeData={{}} />
    );

    expect(screen.getAllByRole("option").length).toEqual(2);
  });

  it("initializes the selected operator when one exists in the formChangeData", () => {
    const queryData: Identity_query = {
      query: {
        allOperators: {
          edges: [
            {
              node: {
                id: "abc",
                rowId: 1,
                legalName: "Test Operator LEGAL",
                tradeName: "Test Operator TRADE",
                bcRegistryId: "123456789",
              },
            },
            {
              node: {
                id: "def",
                rowId: 2,
                legalName: "Second Test Operator LEGAL",
                tradeName: "Second Test Operator TRADE",
                bcRegistryId: "987654321",
              },
            },
          ],
        },
      },
      " $refType": "Identity_query",
    };

    jest
      .spyOn(require("react-relay"), "useFragment")
      .mockImplementation(() => queryData);

    render(
      <Identity
        query={null}
        applyChange={() => null}
        formChangeData={{ operator_id: 1 }}
      />
    );

    expect(screen.getByRole("alert").textContent).toBe(
      "Test Operator LEGAL (123456789)"
    );
  });
});
