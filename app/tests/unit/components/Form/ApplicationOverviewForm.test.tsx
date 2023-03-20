import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationOverviewForm from "components/Form/ApplicationOverviewForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledApplicationOverviewFormTestQuery, {
  ApplicationOverviewFormTestQuery,
} from "__generated__/ApplicationOverviewFormTestQuery.graphql";

const testQuery = graphql`
  query ApplicationOverviewFormTestQuery @relay_test_operation {
    # Spread the fragment you want to test here
    projectRevision(id: "Test Project Revision ID") {
      ...ApplicationOverviewForm_projectRevision
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result = {
      projectFormChange: {
        changeStatus: "pending",
        rowId: 999,
        id: "Test Project Form Change ID",
        formChangeByPreviousFormChangeId: null,
        isUniqueValue: true,
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            year: 2023,
            fundingStreamByFundingStreamId: {
              description: "Emissions Performance",
            },
          },
        },
        newFormData: {
          projectName: "projecty",
          legalName: "legaly",
          fundingStreamRfpId: 7,
        },
      },
    };
    return result;
  },
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
        ],
      },
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<ApplicationOverviewFormTestQuery>({
    component: ApplicationOverviewForm,
    testQuery: testQuery,
    compiledQuery: compiledApplicationOverviewFormTestQuery,
    getPropsFromTestQuery: (data) => ({
      query: data,
      projectRevision: data.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
  });

describe("The Application Overview Form", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    componentTestingHelper.reinit();
  });

  it("calls the mutation passed in with the props with the proper data on form change", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.type(screen.getByLabelText("Project Name"), "new");

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 999,
          formChangePatch: {
            newFormData: {
              projectName: "projectynew",
              legalName: "legaly",
              fundingStreamRfpId: 7,
            },
          },
        },
      }
    );
  });

  it("loads with the correct initial form data", () => {
    jest.useFakeTimers("modern").setSystemTime(new Date("2023-06-06"));
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    // Also ensures that funding stream is read only
    expect(screen.getAllByRole("definition")[0]).toHaveTextContent(
      /Emissions Performance - 2023/i
    );
    expect(screen.getByLabelText<HTMLInputElement>("Project Name").value).toBe(
      "projecty"
    );
    expect(screen.getByLabelText<HTMLInputElement>("Legal Name").value).toBe(
      "legaly"
    );
  });

  it("stages the form_change when clicking on the submit button", () => {
    componentTestingHelper.loadQuery();

    componentTestingHelper.renderComponent();

    act(() => {
      screen.getByText(/submit/i).click();
    });
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 999,
        formChangePatch: {
          newFormData: {
            fundingStreamRfpId: 7,
            projectName: "projecty",
            legalName: "legaly",
          },
        },
      },
    });
  });
  it("clicking the submit button should stage a form with validation errors", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          projectFormChange: {
            rowId: 999,
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            changeStatus: "pending",
            newFormData: {
              fundingStreamRfpId: 8,
            },
          },
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    act(() => {
      screen.getByText(/submit/i).click();
    });
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 999,
        formChangePatch: {},
      },
    });
  });

  it("stages a formChange with null newFormData", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          projectFormChange: {
            rowId: 999,
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            changeStatus: "pending",
            newFormData: null,
          },
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    act(() => {
      screen.getByText(/submit/i).click();
    });

    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 999,
        formChangePatch: {},
      },
    });
  });

  it("reverts the form_change status to 'pending' when editing", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result = {
          projectFormChange: {
            rowId: 999,
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: null,
            newFormData: {
              projectName: "lalala",
              fundingStreamRfpId: 8,
            },
          },
        };
        return result;
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    act(() => {
      userEvent.type(screen.getByLabelText(/project name/i), "2");
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 999,
          formChangePatch: {
            newFormData: {
              fundingStreamRfpId: 8,
              projectName: "lalala2",
            },
          },
        },
      }
    );
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "undoFormChangesMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangesIds: [999],
      },
    });
  });
});
