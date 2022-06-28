import ContactForm from "components/Contact/ContactForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledContactFormTestQuery, {
  ContactFormTestQuery,
} from "__generated__/ContactFormTestQuery.graphql";
import { ContactForm_formChange } from "__generated__/ContactForm_formChange.graphql";

const testQuery = graphql`
  query ContactFormTestQuery @relay_test_operation {
    formChange(id: "fcid") {
      ...ContactForm_formChange
    }
  }
`;

const mockPayload = {
  FormChange() {
    const result: Partial<ContactForm_formChange> = {
      newFormData: {
        email: "foo@example.com",
        phone: "+14155552671",
        comments: "lorem ipsum",
        givenName: "Scooby",
        familyName: "Doo",
        contactPosition: "Detective",
      },
      isUniqueValue: true,
      id: "fcid",
      changeStatus: "pending",
      formDataRecordId: 1,
    };
    return result;
  },
};

const componentTestingHelper = new ComponentTestingHelper<ContactFormTestQuery>(
  {
    component: ContactForm,
    compiledQuery: compiledContactFormTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockPayload,
    getPropsFromTestQuery: (data) => ({ formChange: data.formChange }),
  }
);

describe("The Contact Form component", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    componentTestingHelper.reinit();
  });

  it("renders and submits the correct form data", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByRole("textbox", { name: /given name/i })).toHaveValue(
      "Scooby"
    );
    expect(screen.getByRole("textbox", { name: /family name/i })).toHaveValue(
      "Doo"
    );
    expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue(
      "foo@example.com"
    );
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveValue(
      "(415) 555-2671"
    );
    expect(screen.getByRole("textbox", { name: /position/i })).toHaveValue(
      "Detective"
    );
    expect(screen.getByRole("textbox", { name: /comments/i })).toHaveValue(
      "lorem ipsum"
    );

    // fireEvent();
  });

  // it("displays the correct validation erros when submit is clicked with invalid data", () => {
  //   const mockResolver = {
  //     FormChange() {
  //       const result: Partial<ContactForm_formChange> = {
  //         newFormData: {
  //           email: "foo@example.com",
  //           phone: "+14155552671",
  //           comments: "lorem ipsum",
  //           givenName: null,
  //           familyName: "Doo",
  //           contactPosition: "Detective",
  //         },
  //         isUniqueValue: false,
  //         id: "fcid",
  //         changeStatus: "pending",
  //         formDataRecordId: 1,
  //       };
  //       return result;
  //     },
  //   };
  //   componentTestingHelper.loadQuery(mockResolver);
  //   componentTestingHelper.renderComponent();
  //   expect();
  // });
});
