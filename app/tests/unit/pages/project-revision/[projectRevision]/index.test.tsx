import React from "react";
import { ProjectRevision } from "pages/cif/project-revision/[projectRevision]";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import compiledProjectRevisionQuery, {
  ProjectRevisionQuery,
} from "__generated__/ProjectRevisionQuery.graphql";
import ProjectForm from "components/Form/ProjectForm";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { mocked } from "jest-mock";

jest.mock("components/Form/ProjectForm");
jest.mock("components/Form/ProjectManagerFormGroup");
jest.mock("components/Form/ProjectContactForm");

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

const query = compiledProjectRevisionQuery; // can be the same, or just identical
const variables = {
  projectRevision: "mock-id",
};
environment.mock.queuePendingOperation(query, variables);

describe("The Create Project page", () => {
  beforeEach(() => {
    mocked(ProjectForm).mockReset();
    mocked(ProjectManagerFormGroup).mockReset();
    mocked(ProjectContactForm).mockReset();

    mocked(ProjectForm).mockImplementation((props) => {
      props.setValidatingForm({
        selfValidate: jest.fn().mockImplementation(() => []),
      });
      return null;
    });
    mocked(ProjectManagerFormGroup).mockImplementation((props) => {
      props.setValidatingForm({
        selfValidate: jest.fn().mockImplementation(() => []),
      });
      return null;
    });
    mocked(ProjectContactForm).mockImplementation((props) => {
      props.setValidatingForm({
        selfValidate: jest.fn().mockImplementation(() => []),
      });
      return null;
    });
    jest.restoreAllMocks();
  });

  const initialQueryRef = loadQuery<ProjectRevisionQuery>(
    environment,
    compiledProjectRevisionQuery,
    variables
  );

  it("calls the updateProjectRevision mutation when the Submit Button is clicked & input values are valid", async () => {
    const spy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [spy, false]);

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    userEvent.click(screen.queryByText("Submit"));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      updater: expect.any(Function),
      variables: {
        input: {
          id: "mock-proj-rev-id",
          projectRevisionPatch: { changeStatus: "committed" },
        },
      },
    });
  });

  it("doesn't call the updateProjectRevision mutation when the Submit button is clicked & input values are invalid", async () => {
    mocked(ProjectForm).mockImplementation((props) => {
      props.setValidatingForm({
        selfValidate: jest.fn().mockImplementation(() => [{ error: "error!" }]),
      });
      return null;
    });
    mocked(ProjectManagerFormGroup).mockImplementation((props) => {
      props.setValidatingForm({
        selfValidate: jest.fn().mockImplementation(() => []),
      });
      return null;
    });

    const spy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [spy, false]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    userEvent.click(screen.queryByText("Submit"));

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("Renders an enabled submit and discard changes button", async () => {
    const mockProjectForm: any = { props: {} };
    mocked(ProjectForm).mockImplementation((props) => {
      mockProjectForm.props = props;
      return null;
    });

    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [jest.fn(), false]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="4"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Submit")).toHaveProperty("disabled", false);
    expect(screen.getByText("Discard Changes")).toHaveProperty(
      "disabled",
      false
    );
  });

  it("Calls the delete mutation when the user clicks the Discard Changes button", async () => {
    const useMutationSpy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [useMutationSpy, false]);

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    act(() => userEvent.click(screen.queryByText("Discard Changes")));

    expect(useMutationSpy).toHaveBeenCalledTimes(1);
    expect(useMutationSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      onError: expect.any(Function),
      variables: {
        input: {
          id: "mock-proj-rev-id",
        },
      },
    });
  });

  it("renders a disabled submit / discard button when project revision mutations are in flight", async () => {
    const mockProjectForm: any = { props: {} };
    mocked(ProjectForm).mockImplementation((props) => {
      mockProjectForm.props = props;
      return null;
    });

    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [jest.fn(), true]);

    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="2"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.queryByText("Submit")).toHaveProperty("disabled", true);
    expect(screen.queryByText("Discard Changes")).toHaveProperty(
      "disabled",
      true
    );
  });

  it("renders null when a revision doesn't exist", async () => {
    const spy = jest
      .spyOn(require("app/hooks/useRedirectTo404IfFalsy"), "default")
      .mockImplementation(() => {
        return true;
      });
    const { container } = render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision
          data-testid="3"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith("mock-proj-rev-id");
  });
});
