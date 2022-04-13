import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
  });

  it("renders the project forms", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/overview");
    cy.get("button").contains("Submit Project Overview");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "empty",
    });

    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/managers");
    cy.injectAxe();
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Managers Form",
      variant: "empty",
    });

    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/contacts");

    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();

    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Contacts Form",
      variant: "empty",
    });

    cy.findByText(/review and submit information/i).click();
    cy.findByText(/project overview not added/i).should("be.visible");
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Summary Form",
      variant: "empty",
    });
  });

  it("properly displays validation errors", () => {
    // load more projects to trigger unique proposal reference error
    cy.sqlFixture("dev/004_cif_project");
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/overview");

    cy.findByLabelText(/Proposal Reference/i).type("001");
    cy.injectAxe();
    // Check error message accessibility
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit Project Overview").click();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "with errors",
    });
    cy.get(".error-detail").should("have.length", 6);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");

    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/contacts");

    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit").click();
    cy.get(".error-detail").should("have.length", 4);
    cy.injectAxe();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Contacts Form",
      variant: "with errors",
    });
  });

  it("Allows to create and update a project", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/overview");
    cy.findByLabelText(/Project Name/i).type("Foo");
    cy.findByLabelText(/Total Funding Request/i).type("100");
    cy.findByLabelText(/Summary/i).type("Bar");
    cy.findByLabelText(/Proposal Reference/i).type("TEST-123-12345");
    cy.findByLabelText(/Operator Name/i).click();
    cy.contains("first operator").click();
    cy.findByLabelText(/Funding Stream$/i).select("Emissions Performance");
    cy.findByLabelText(/Funding Stream RFP/i).select("2020");
    cy.findByLabelText(/Project Status/i).select("Project Underway");

    // There is a bug where if cypress starts changing another form on the page too quickly,
    // the last change is discarded and rjsf throws an error.
    cy.contains("Changes saved");
    cy.findByRole("button", { name: /submit/i }).click();

    cy.contains("Review and Submit Project");
    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/managers");

    cy.findByLabelText(/tech team primary/i).click();
    cy.contains("Swanson").click();
    cy.findByLabelText(/tech team secondary/i).click();
    cy.contains("Ludgate").click();
    cy.findByLabelText(/ops team primary/i).click();
    cy.contains("Knope").click();

    // FIXME: adding project managers does not trigger the saving indicator
    cy.wait(1000);

    cy.contains("Changes saved");
    cy.findByRole("button", { name: /submit/i }).click();

    cy.contains("Review and Submit Project");
    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/contacts");

    cy.findByLabelText(/Primary contact/i).click();
    cy.contains("Loblaw003").click();

    // TODO: figure out why we need to wait when setting the primary contact
    cy.wait(1000);
    cy.get("button").contains("Add").click();
    // TODO: figure out why we need to wait when setting the primary contact
    cy.wait(1000);
    cy.get("label")
      .contains("Secondary Contacts")
      .parent()
      .find("input")
      .last()
      .click();
    cy.contains("Loblaw004").click();
    // TODO: figure out why we need to wait when setting the primary contact
    cy.wait(1000);

    cy.findByRole("button", { name: /submit/i }).click();

    cy.contains("Review and Submit Project");

    // check summary page
    cy.findByText(/Funding Stream RFP ID/i)
      .next()
      .should("have.text", "Emissions Performance - 2020");
    cy.findByText(/Operator Name/i)
      .next()
      .should("have.text", "first operator legal name (AB1234567)");
    cy.findByText(/Proposal Reference/i)
      .next()
      .should("have.text", "TEST-123-12345");

    cy.findByText(/Project Name/i)
      .next()
      .should("have.text", "Foo");
    cy.findByText(/Summary/i)
      .next()
      .should("have.text", "Bar");
    cy.findByText(/Total Funding Request/i)
      .next()
      .should("have.text", "$100.00");
    cy.findByText(/Project Status/i)
      .next()
      .should("have.text", "Project Underway");
    cy.findByText(/tech team primary/i)
      .next()
      .should("have.text", "Swanson, Ron");
    cy.findByText(/tech team secondary/i)
      .next()
      .should("have.text", "Ludgate, April");
    cy.findByText(/ops team primary/i)
      .next()
      .should("have.text", "Knope, Leslie");
    cy.contains(/Primary contact/i)
      .next()
      .should("have.text", "Loblaw003, Bob003");
    cy.findByText(/Secondary contacts/i)
      .next()
      .should("have.text", "Loblaw004, Bob004");

    cy.findByRole("button", { name: /submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("View").click();
    cy.url().should("include", "/cif/project/");
    cy.useMockedTime(new Date("June 10, 2020 09:00:01"));
    cy.findByText("Edit").click();
    cy.url().should("include", "/form/overview");

    // Edit the project
    // change the name, delete a manager and contact.
    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Foo")
      .clear()
      .type("Bar");

    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "editing",
    });
    cy.findByRole("button", { name: /submit/i }).click();
    cy.contains("Review and Submit Project");
    cy.findByText(/Edit project managers/i).click();
    cy.url().should("include", "/form/managers");

    cy.findByLabelText(/tech team secondary/i).should(
      "have.value",
      "Ludgate, April"
    );
    cy.get("label")
      .contains("Tech Team Secondary")
      .next()
      .find("button")
      .contains("Clear")
      .click();
    cy.findByLabelText(/tech team secondary/i).should("be.empty");

    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /submit/i }).click();
    cy.contains("Review and Submit Project");
    cy.findByText(/Edit project contacts/i).click();
    cy.url().should("include", "/form/contacts");

    cy.get("label")
      .contains("Secondary Contacts")
      .parent()
      .find("button")
      .contains("Remove")
      .click();
    cy.wait(1000);

    cy.contains("Changes saved.");
    cy.pause();
    cy.findByRole("button", { name: /submit/i }).click();
    cy.contains("Review and Submit Project");

    cy.findByText(/Project Name/i)
      .next()
      .should("have.text", "Bar");
    cy.findByText(/tech team secondary/i).should("not.exist");

    cy.findByText(/Secondary Contacts/i)
      .next()
      .should("have.text", "Not added");

    cy.findByRole("button", { name: /submit/i }).click();

    cy.url().should("include", "/cif/projects");
    cy.findByRole("button", { name: /view/i }).click();
    cy.url().should("include", "/cif/project/");
    cy.findByRole("button", { name: /edit/i }).click();
    cy.url().should("include", "/form/overview");

    // Check the project was updated
    cy.findByLabelText(/Project Name/i).should("have.value", "Bar");
    cy.findByText(/Edit project managers/i).click();
    cy.findByLabelText(/tech team secondary/i).should("not.have.value");
    cy.findByText(/Edit project contacts/i).click();
    cy.get("fieldset").find("input").should("have.length", 1);
  });
});
