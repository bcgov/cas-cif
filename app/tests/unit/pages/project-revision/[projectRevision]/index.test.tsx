import React from "react";
import { ProjectRevision } from "pages/cif/project-revision/[projectRevision]";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import compiledProjectRevisionQuery, {
  ProjectRevisionQuery,
  ProjectRevisionQuery$variables,
} from "__generated__/ProjectRevisionQuery.graphql";
import ProjectForm from "components/Form/ProjectForm";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { mocked } from "jest-mock";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { useRouter } from "next/router";

jest.mock("next/router");
jest.mock("components/Form/ProjectForm");
jest.mock("components/Form/ProjectManagerFormGroup");
jest.mock("components/Form/ProjectContactForm");

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
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
};

const loadProjectRevisionQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: ProjectRevisionQuery$variables = {
    projectRevision: "mock-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(
    compiledProjectRevisionQuery,
    variables
  );
  initialQueryRef = loadQuery<ProjectRevisionQuery>(
    environment,
    compiledProjectRevisionQuery,
    variables
  );
};

const renderProjectRevisionPage = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <ProjectRevision CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The Create Project page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    mocked(ProjectForm).mockReset();
    mocked(ProjectManagerFormGroup).mockReset();
    mocked(ProjectContactForm).mockReset();

    mocked(ProjectForm).mockImplementation(() => {
      return null;
    });
    mocked(ProjectManagerFormGroup).mockImplementation(() => {
      return null;
    });
    mocked(ProjectContactForm).mockImplementation(() => {
      return null;
    });
    jest.restoreAllMocks();
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

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

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

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

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

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

    expect(screen.queryByText("Submit")).toHaveProperty("disabled", true);
    expect(screen.queryByText("Discard Changes")).toHaveProperty(
      "disabled",
      true
    );
  });

  it("renders null when a revision doesn't exist", async () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );

    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
    loadProjectRevisionQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = renderProjectRevisionPage();

    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
