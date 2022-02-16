import { ContactViewPage } from "pages/cif/contact/[contact]";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import compiledContactViewQuery, {
  ContactViewQuery,
} from "__generated__/ContactViewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";

let environment;

const loadContactData = (partialContact = {}, partialSession = {}) => {
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
      Session() {
        return {
          cifUserBySub: {
            id: "mock-cif-user-id",
          },
          ...partialSession,
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
  });

  it("renders a disabled edit button when the contact is being edited by a different user", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <ContactViewPage
          CSN
          preloadedQuery={loadContactData({
            pendingFormChange: {
              id: "mock-form-change-id",
              cifUserByCreatedBy: {
                id: "mock-other-cif-user-id",
              },
            },
          })}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Resume Editing")).toBeDisabled();
    expect(
      screen.getByText(
        "This contact is currently being edited by another user."
      )
    ).toBeInTheDocument();
  });
});
