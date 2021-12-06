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
    FormChange() {
      return {
        id: "mock-id",
        newFormData: {
          someQueryData: "test",
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

    expect(screen.getAllByRole("button")[1]).toHaveTextContent(
      "Commit Project Changes"
    );
    expect(screen.getAllByRole("textbox")[0]).toHaveTextContent("");
  });

  it("calls the updateFormChange mutation when the component calls the callback", async () => {
    const mockProjectBackground: any = { props: {} };
    jest
      .spyOn(require("components/Project/ProjectBackgroundForm"), "default")
      .mockImplementation((props) => {
        mockProjectBackground.props = props;
        return null;
      });

    const spy = jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => "updated");
    render(
      <RelayEnvironmentProvider environment={environment}>
        <CreateProject
          data-testid="2"
          CSN={true}
          preloadedQuery={initialQueryRef}
        />
      </RelayEnvironmentProvider>
    );

    mockProjectBackground.props.onChange({
      someQueryData: "testvalue",
      other: 123,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(RelayModernEnvironment), {
      input: {
        formChangePatch: {
          newFormData: { other: 123, someQueryData: "testvalue" },
        },
        id: "mock-id",
      },
    });
  });

  it("calls the updateFormChange mutation when the Submit Button is clicked & input values are valid", async () => {
    jest
      .spyOn(require("components/Project/ProjectBackgroundForm"), "default")
      .mockImplementation(() => {
        return null;
      });

    const spy = jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
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
        formChangePatch: { changeStatus: "committed" },
        id: "mock-id",
      },
    });
  });

  it("Renders a disabled button when the form reports errors", async () => {
    const mockProjectBackground: any = { props: {} };
    jest
      .spyOn(require("components/Project/ProjectBackgroundForm"), "default")
      .mockImplementation((props) => {
        mockProjectBackground.props = props;
        return null;
      });

    jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => {});
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
      mockProjectBackground.props.onFormErrors({
        testfield: { haserrors: true },
      });
    });

    expect(screen.getAllByRole("button")[1]).toHaveProperty("disabled", true);
  });

  it("Renders an enabled button when the form reports no errors", async () => {
    const mockProjectBackground: any = { props: {} };
    jest
      .spyOn(require("components/Project/ProjectBackgroundForm"), "default")
      .mockImplementation((props) => {
        mockProjectBackground.props = props;
        return null;
      });

    jest
      .spyOn(require("mutations/FormChange/updateFormChange"), "default")
      .mockImplementation(() => {});

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
      mockProjectBackground.props.onFormErrors({
        testfield: null,
      });
    });

    expect(screen.getAllByRole("button")[1]).toHaveProperty("disabled", false);
  });
});
