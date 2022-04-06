import React from "react";
import { ProjectManagersForm } from "pages/cif/project-revision/[projectRevision]/form/managers";
import { render, within, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import compiledManagersFormQuery, {
  managersFormQuery,
  managersFormQuery$variables,
} from "__generated__/managersFormQuery.graphql";
import { mocked } from "jest-mock";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";

jest.mock("next/router");

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

const loadPageQuery = (mockResolver: MockResolvers = defaultMockResolver) => {
  const variables: managersFormQuery$variables = {
    projectRevision: "mock-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(compiledManagersFormQuery, variables);
  initialQueryRef = loadQuery<managersFormQuery>(
    environment,
    compiledManagersFormQuery,
    variables
  );
};

const renderPage = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <ProjectManagersForm CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The Project Managers form page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders the task list in the left navigation", () => {
    const router = mocked(useRouter);
    const mockPathname =
      "/cif/project-revision/[projectRevision]/form/managers";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);
    loadPageQuery();
    renderPage();
    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/add a project/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add project managers/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("redirects the user to the project revision page on submit", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectManagerFormGroup"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    loadPageQuery();
    renderPage();
    handleSubmit();
    expect(mockPush).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-id")
    );
  });

  it("renders null and redirects to a 404 page when a revision doesn't exist", async () => {
    const mockReplace = jest.fn();
    mocked(useRouter).mockReturnValue({
      replace: mockReplace,
    } as any);

    loadPageQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = renderPage();

    expect(container.childElementCount).toEqual(0);
    expect(mockReplace).toHaveBeenCalledWith("/404");
  });
});
