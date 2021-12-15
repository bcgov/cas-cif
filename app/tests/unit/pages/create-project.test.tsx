import React from "react";
import { CreateProject } from "pages/cif/create-project";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import compiledCreateProjectQuery, {
  createProjectQuery,
} from "__generated__/createProjectQuery.graphql";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";

const environment = createMockEnvironment();

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

environment.mock.queueOperationResolver((operation) => {
  return MockPayloadGenerator.generate(operation, {
    ProjectRevision() {
      return {
        id: "mock-proj-rev-id",
        projectManagerFormChange: {
          id: "mock-projectmanager-form-id",
          newFormData: {
            someQueryData: "test",
          },
        },
        projectFormChange: {
          id: "mock-project-form-id",
          newFormData: {
            someProjectData: "test2",
          },
        },
      };
    },
  });
});

const query = compiledCreateProjectQuery; // can be the same, or just identical
const variables = {
  id: "mock-id",
};
environment.mock.queuePendingOperation(query, variables);

describe("The Create Project page", () => {
  const initialQueryRef = loadQuery<createProjectQuery>(
    environment,
    compiledCreateProjectQuery,
    { id: "mock-id" }
  );

  it("loads the Create Project Button", async () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="1"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );
    expect(
      screen.getAllByRole("button")[screen.getAllByRole("button").length - 1]
    ).toHaveTextContent("Commit Project Changes");
    expect(screen.getAllByRole("textbox")[0]).toHaveTextContent("");
  });

  it("calls the updateFormChange mutation when the component calls the callback", async () => {
    const mockProjectForm: any = { props: {} };
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation((props) => {
        mockProjectForm.props = props;
        return null;
      });

    const commitFormChangeMutationSpy = jest.fn();
    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [commitFormChangeMutationSpy, jest.fn()]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="2"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    mockProjectForm.props.onChange({
      someQueryData: "testvalue",
      other: 123,
    });

    expect(commitFormChangeMutationSpy).toHaveBeenCalledTimes(1);
    expect(commitFormChangeMutationSpy).toHaveBeenCalledWith({
      debounceKey: "mock-project-form-id",
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: "mock-project-form-id",
            newFormData: {
              other: 123,
              someQueryData: "testvalue",
              someProjectData: "test2",
            },
          },
        },
      },
      variables: {
        input: {
          formChangePatch: {
            newFormData: {
              other: 123,
              someQueryData: "testvalue",
              someProjectData: "test2",
            },
          },
          id: "mock-project-form-id",
        },
      },
    });
  });

  it("calls the updateFormChange mutation when the Submit Button is clicked & input values are valid", async () => {
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation(() => {
        return null;
      });
    jest
      .spyOn(require("components/Form/ProjectManagerForm"), "default")
      .mockImplementation(() => {
        return null;
      });

    const spy = jest
      .spyOn(
        require("mutations/ProjectRevision/updateProjectRevision"),
        "default"
      )
      .mockImplementation(() => {});

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    userEvent.click(screen.getAllByRole("button")[1]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(RelayModernEnvironment), {
      input: {
        projectRevisionPatch: { changeStatus: "committed" },
        id: "mock-proj-rev-id",
      },
    });
  });

  it("Renders a disabled button when the form reports errors", async () => {
    const mockProjectForm: any = { props: {} };
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation((props) => {
        mockProjectForm.props = props;
        return null;
      });

    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [jest.fn(), jest.fn()]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="4"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    act(() => {
      mockProjectForm.props.onFormErrors([
        {
          testfield: { haserrors: true },
        },
      ]);
    });

    expect(screen.queryAllByText("Commit Project Changes")[0]).toHaveProperty(
      "disabled",
      true
    );
  });

  it("Renders an enabled button when the form reports no errors", async () => {
    const mockProjectForm: any = { props: {} };
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation((props) => {
        mockProjectForm.props = props;
        return null;
      });

    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [jest.fn(), jest.fn()]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="4"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    act(() => {
      mockProjectForm.props.onFormErrors([]);
    });

    expect(screen.queryAllByText("Commit Project Changes")[0]).toHaveProperty(
      "disabled",
      false
    );
  });
});
