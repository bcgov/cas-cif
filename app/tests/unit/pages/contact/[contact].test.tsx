import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactViewPage } from "pages/cif/contact/[contact]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledContactViewQuery, {
  ContactViewQuery,
} from "__generated__/ContactViewQuery.graphql";

const defaultMockResolver = {
  Contact() {
    return {
      id: "mock-contact-id",
      rowId: 42,
      fullName: "Contact, Test",
      fullPhone: "(123) 456-7890",
      email: "foo@bar.com",
      contactPosition: "Test Position",
      pendingFormChange: null,
    };
  },
};

const pageTestingHelper = new PageTestingHelper<ContactViewQuery>({
  pageComponent: ContactViewPage,
  compiledQuery: compiledContactViewQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    contact: "mock-contact-id",
  },
});

describe("ContactViewPage", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("renders null if the contact doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );

    pageTestingHelper.loadQuery({
      Query() {
        return {
          contact: null,
        };
      },
    });
    const { container } = pageTestingHelper.renderPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });

  it("displays all the contact data", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText("Contact, Test")).toBeInTheDocument();
    expect(screen.getByText("(123) 456-7890")).toBeInTheDocument();
    expect(screen.getByText("foo@bar.com")).toBeInTheDocument();
    expect(screen.getByText("Test Position")).toBeInTheDocument();

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("does not display labels for optional information if not included", () => {
    pageTestingHelper.loadQuery({
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: null,
          comments: null,
          companyName: null,
          contactPosition: null,
          pendingFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    expect(screen.queryByText("Phone Extension")).not.toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
    expect(screen.queryByText("Position")).not.toBeInTheDocument();
    expect(screen.queryByText("Comments")).not.toBeInTheDocument();
  });

  it("renders a resume edit button when the contact already has a pending form change", () => {
    pageTestingHelper.loadQuery({
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: "(123) 456-7890",
          email: "foo@bar.com",
          contactPosition: "Test Position",
          pendingFormChange: {
            id: "mock-form-change-id",
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });

  it("displays an error when the user clicks the edit button & createEditContactFormChangeMutation mutation fails", () => {
    pageTestingHelper.loadQuery({
      Contact() {
        return {
          id: "mock-contact-id",
          rowId: 42,
          fullName: "Contact, Test",
          fullPhone: "(123) 456-7890",
          email: "foo@bar.com",
          contactPosition: "Test Position",
          pendingFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Edit/i));

    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("An error occurred when editing a contact.")
    ).toBeVisible();
  });
});
