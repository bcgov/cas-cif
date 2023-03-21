import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectRfpForm from "components/Form/ProjectRfpForm";
import { graphql } from "react-relay";
import { MockPayloadGenerator } from "relay-test-utils";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectRfpFormTestQuery, {
  ProjectRfpFormTestQuery,
} from "__generated__/ProjectRfpFormTestQuery.graphql";

const testQuery = graphql`
  query ProjectRfpFormTestQuery @relay_test_operation {
    # Spread the fragment you want to test here
    ...ProjectRfpForm_query
  }
`;

const defaultMockResolver = {
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
          // {
          //   node: {
          //     rowId: 2,
          //     year: 2020,
          //     fundingStreamId: 1,
          //   },
          // },
          // {
          //   node: {
          //     rowId: 3,
          //     year: 2021,
          //     fundingStreamId: 1,
          //   },
          // },
          // {
          //   node: {
          //     rowId: 4,
          //     year: 2022,
          //     fundingStreamId: 1,
          //   },
          // },
          // {
          //   node: {
          //     rowId: 5,
          //     year: 2021,
          //     fundingStreamId: 2,
          //   },
          // },
          // {
          //   node: {
          //     rowId: 6,
          //     year: 2022,
          //     fundingStreamId: 2,
          //   },
          // },
        ],
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
  isInternal: true,
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectRfpFormTestQuery>({
    component: ProjectRfpForm,
    testQuery: testQuery,
    compiledQuery: compiledProjectRfpFormTestQuery,
    getPropsFromTestQuery: (data) => ({
      query: data,
      projectRevision: data.projectRevision,
    }),
    defaultQueryResolver: defaultMockResolver,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("ProjectRevisionNew Page", () => {
  beforeEach(() => {
    jest.useRealTimers();

    componentTestingHelper.reinit();
  });

  it("Triggers the createProject mutation and redirects when the user clicks the Confirm button", async () => {
    jest.useFakeTimers("modern").setSystemTime(new Date("2019-06-06"));
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText(/select-parent-dropdown-root_fundingStreamRfpId/i)
    ).toBeInTheDocument();

    userEvent.selectOptions(
      screen.getByLabelText(/select-parent-dropdown-root_fundingStreamRfpId/i),
      ["Emissions Performance"]
    );
    userEvent.selectOptions(
      screen.getByLabelText(
        "select-child-dropdown-root_fundingStreamRfpId-select"
      ),
      ["2019"]
    );

    await act(() =>
      userEvent.click(screen.getByRole("button", { name: /confirm/i }))
    );

    componentTestingHelper.expectMutationToBeCalled("createProjectMutation", {
      input: {
        fundingStreamRpfId: 1,
      },
    });
    const operation =
      componentTestingHelper.environment.mock.getMostRecentOperation();
    act(() => {
      componentTestingHelper.environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(componentTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        projectRevision: "<ProjectRevision-mock-id-1>",
        formIndex: 0,
        isRoutedFromNew: true,
      },
      anchor: undefined,
    });
  });

  it("Triggers an error if the confirm button is clicked and the form is incomplete", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    await act(() =>
      userEvent.click(screen.getByRole("button", { name: /confirm/i }))
    );
    expect(screen.getByText(/Please enter a value/i)).toBeInTheDocument();
  });
});
