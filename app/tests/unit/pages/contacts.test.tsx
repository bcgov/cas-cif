import React from "react";
import { Contacts, ContactsQuery } from "../../../pages/cif/contacts";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import {
  contactsQuery,
  contactsQuery$variables,
} from "__generated__/contactsQuery.graphql";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
import userEvent from "@testing-library/user-event";
import { ErrorContext } from "contexts/ErrorContext";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allContacts: {
        totalCount: 2,
        edges: [
          { node: { id: "1", fullName: "Contact 1" } },
          { node: { id: "2", fullName: "Contact 2" } },
        ],
      },
      pendingNewContactFormChange: null,
    };
  },
};

const loadContactsQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: contactsQuery$variables = {
    fullName: null,
    fullPhone: null,
    position: null,
    offset: null,
    pageSize: null,
    orderBy: null,
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(ContactsQuery, variables);
  initialQueryRef = loadQuery<contactsQuery>(
    environment,
    ContactsQuery,
    variables
  );
};
let errorContext;
const renderContacts = () =>
  render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <Contacts CSN preloadedQuery={initialQueryRef} />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );

describe("The contacts page", () => {
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
  });

  it("renders the list of contacts", () => {
    loadContactsQuery();
    renderContacts();

    expect(screen.getByText(/Contact 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact 2/i)).toBeInTheDocument();
  });

  it("displays the Add a Contact Button", () => {
    loadContactsQuery();
    renderContacts();

    expect(screen.getByText(/Add a Contact/i)).toBeInTheDocument();
  });

  it("displays an error when the Add button is clicked & createNewContactFormChangeMutation fails", () => {
    loadContactsQuery();
    renderContacts();

    userEvent.click(screen.getByText(/Add a Contact/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the contact."
      )
    ).toBeVisible();
  });

  it("displays the Resume Contact Creation button if there is an existing form_change", () => {
    loadContactsQuery({
      Query() {
        return {
          ...defaultMockResolver.Query(),
          pendingNewContactFormChange: {
            id: "abcde",
          },
        };
      },
    });
    renderContacts();

    expect(screen.getByText(/Resume Contact Creation/i)).toBeInTheDocument();
  });
});
