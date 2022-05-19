import "@testing-library/jest-dom";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledContactsQuery, {
  contactsQuery,
} from "__generated__/contactsQuery.graphql";
import { Contacts } from "../../../pages/cif/contacts";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

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

const pageTestingHelper = new PageTestingHelper<contactsQuery>({
  pageComponent: Contacts,
  compiledQuery: compiledContactsQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    fullName: null,
    fullPhone: null,
    contactPosition: null,
    offset: null,
    pageSize: null,
    orderBy: null,
  },
});

describe("The contacts page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the list of contacts", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Contact 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact 2/i)).toBeInTheDocument();
  });

  it("displays the Add a Contact Button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Add a Contact/i)).toBeInTheDocument();
  });

  it("displays an error when the Add button is clicked & createNewContactFormChangeMutation fails", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    userEvent.click(screen.getByText(/Add a Contact/i));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the contact."
      )
    ).toBeVisible();
  });

  it("displays the Resume Contact Creation button if there is an existing form_change", () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          ...defaultMockResolver.Query(),
          pendingNewContactFormChange: {
            id: "abcde",
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Resume Contact Creation/i)).toBeInTheDocument();
  });
});
