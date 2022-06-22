import { screen } from "@testing-library/react";
import ContactDetails from "components/Contact/ContactDetails";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledContactDetailsTestQuery, {
  ContactDetailsTestQuery,
} from "__generated__/ContactDetailsTestQuery.graphql";
import { ContactDetails_contact } from "__generated__/ContactDetails_contact.graphql";

const testQuery = graphql`
  query ContactDetailsTestQuery @relay_test_operation {
    query {
      contact(id: "test-contact") {
        ...ContactDetails_contact
      }
    }
  }
`;

const mockPayload = {
  Contact() {
    const result: Partial<ContactDetails_contact> = {
      email: "foo@bar.com",
      companyName: "bar",
      contactPosition: "mngr",
    };
    return result;
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<ContactDetailsTestQuery>({
    component: ContactDetails,
    compiledQuery: compiledContactDetailsTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockPayload,
    getPropsFromTestQuery: (data) => ({ contact: data.query.contact }),
  });

describe("The Contact Details component", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    componentTestingHelper.reinit();
  });

  it("displays the right information", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/email/i).closest("p")).toHaveTextContent(
      /foo@bar.com/i
    );
    expect(screen.getByText(/company/i).closest("p")).toHaveTextContent(/bar/i);
    expect(screen.getByText(/position/i).closest("p")).toHaveTextContent(
      /mngr/i
    );
  });
});
