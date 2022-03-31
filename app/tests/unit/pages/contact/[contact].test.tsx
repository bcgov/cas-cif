import { ContactViewPage } from "pages/cif/contact/[contact]";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { render, screen, act } from "@testing-library/react";
import compiledContactViewQuery, {
  ContactViewQuery,
  ContactViewQuery$variables,
} from "__generated__/ContactViewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
import userEvent from "@testing-library/user-event";
import { ErrorContext } from "contexts/ErrorContext";

jest.mock("next/router");

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Contact() {
    return {
      id: "mock-contact-id",
      rowId: 42,
      fullName: "Contact, Test",
      fullPhone: "(123) 456-7890",
      email: "foo@bar.com",
      position: "Test Position",
      pendingFormChange: null,
    };
  },
};

const loadContactQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: ContactViewQuery$variables = {
    contact: "mock-contact-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(compiledContactViewQuery, variables);

  initialQueryRef = loadQuery<ContactViewQuery>(
    environment,
    compiledContactViewQuery,
    variables
  );
};
let errorContext;
const renderContactPage = () =>
  render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <ContactViewPage CSN preloadedQuery={initialQueryRef} />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );

describe("ContactViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          errorContext.error = error;
        })
      ),
    };
    jest.restoreAllMocks();
  });

  it("renders null if the contact doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );
    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
    loadContactQuery({
      Query() {
        return {
          contact: null,
        };
      },
    });
    const { container } = renderContactPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });

  it("displays the contact data", () => {
    loadContactQuery();
    renderContactPage();

    expect(screen.getByText("Contact, Test")).toBeInTheDocument();
    expect(screen.getByText("(123) 456-7890")).toBeInTheDocument();
    expect(screen.getByText("foo@bar.com")).toBeInTheDocument();
    expect(screen.getByText("Test Position")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders a resume edit button when the contact already has a pending form change", () => {
    loadContactQuery({
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: "(123) 456-7890",
          email: "foo@bar.com",
          position: "Test Position",
          pendingFormChange: {
            id: "mock-form-change-id",
          },
        };
      },
    });
    renderContactPage();

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });

  it("displays an error when the user clicks the edit button & createEditContactFormChangeMutation mutation fails", () => {
    loadContactQuery({
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: "(123) 456-7890",
          email: "foo@bar.com",
          position: "Test Position",
          pendingFormChange: null,
        };
      },
    });
    renderContactPage();
    userEvent.click(screen.getByText(/Edit/i));

    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("An error occurred when editing a contact.")
    ).toBeVisible();
  });
});
