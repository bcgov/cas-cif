import { ContactViewPage } from "pages/cif/contact/[contact]";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import compiledContactViewQuery, {
  ContactViewQuery,
} from "__generated__/ContactViewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";

let environment;

const loadContactData = (partialContact = {}) => {
  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, {
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: "(123) 456-7890",
          email: "foo@bar.com",
          position: "Test Position",
          pendingFormChange: null,
          ...partialContact,
        };
      },
    });
  });

  const variables = {
    contact: "mock-contact-id",
  };
  environment.mock.queuePendingOperation(compiledContactViewQuery, variables);
  return loadQuery<ContactViewQuery>(
    environment,
    compiledContactViewQuery,
    variables
  );
};

describe("ContactViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    jest.restoreAllMocks();
  });

  it("renders null if the contact doesn't exist", () => {
    const spy = jest
      .spyOn(require("app/hooks/useRedirectTo404IfFalsy"), "default")
      .mockImplementation(() => {
        return true;
      });
    const { container } = render(
      <RelayEnvironmentProvider environment={environment}>
        <ContactViewPage CSN preloadedQuery={loadContactData()} />
      </RelayEnvironmentProvider>
    );
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mock-contact-id" })
    );
  });

  it("displays the contact data", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <ContactViewPage CSN preloadedQuery={loadContactData()} />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Contact, Test")).toBeInTheDocument();
    expect(screen.getByText("(123) 456-7890")).toBeInTheDocument();
    expect(screen.getByText("foo@bar.com")).toBeInTheDocument();
    expect(screen.getByText("Test Position")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders a resume edit button when the contact already has a pending form change", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <ContactViewPage
          CSN
          preloadedQuery={loadContactData({
            pendingFormChange: {
              id: "mock-form-change-id",
            },
          })}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });
});
