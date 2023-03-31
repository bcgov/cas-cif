import { screen } from "@testing-library/react";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledSelectRfpWidgetTestQuery, {
  SelectRfpWidgetTestQuery,
} from "__generated__/SelectRfpWidgetTestQuery.graphql";

const testQuery = graphql`
  query SelectRfpWidgetTestQuery @relay_test_operation {
    query {
      ...SelectRfpWidget_query
    }
  }
`;

const mockPayload = {
  Query() {
    return {
      allFundingStreams: {
        edges: [
          {
            node: {
              rowId: 1,
              name: "EP",
              description: "Emissions Performance",
            },
          },
          {
            node: {
              rowId: 2,
              name: "IA",
              description: "Innovation Accelerator",
            },
          },
        ],
      },
      allFundingStreamRfps: {
        edges: [
          {
            node: {
              rowId: 1,
              year: 2019,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 2,
              year: 2020,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 3,
              year: 2021,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 4,
              year: 2022,
              fundingStreamId: 1,
            },
          },
          {
            node: {
              rowId: 5,
              year: 2021,
              fundingStreamId: 2,
            },
          },
          {
            node: {
              rowId: 6,
              year: 2022,
              fundingStreamId: 2,
            },
          },
        ],
      },
    };
  },
};
const componentTestingHelper =
  new ComponentTestingHelper<SelectRfpWidgetTestQuery>({
    component: SelectRfpWidget,
    compiledQuery: compiledSelectRfpWidgetTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockPayload,
    getPropsFromTestQuery: (data) => ({
      formContext: { query: data.query, isInternal: true },
    }),
  });
describe("The SelectRfpWidget", () => {
  beforeEach(() => {
    jest.useRealTimers();
    componentTestingHelper.reinit();
  });
  it("renders the funding stream and year dropdowns for an internal user", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const parentDropdown = screen.getByLabelText(/Funding Stream/i);
    expect(parentDropdown.value).toEqual("Select a Funding Stream");
    const childDropdown = screen.getByLabelText(/RFP Year/i);
    expect(childDropdown.value).toEqual("Select a RFP Year");
  });

  it("renders the funding stream and year dropdowns for an external user", () => {
    jest.useFakeTimers("modern").setSystemTime(new Date("2025-06-06"));

    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent((data) => ({
      formContext: { query: data.query, isInternal: false },
    }));
    const parentDropdown = screen.getByLabelText(/Funding Stream/i);
    expect(parentDropdown.value).toEqual("Select a Funding Stream");
    const childDropdown = screen.getByLabelText(/RFP Year/i);
    expect(childDropdown.value).toEqual("2025");
  });
});
