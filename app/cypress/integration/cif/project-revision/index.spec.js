import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/004_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
  });

  it("renders the project overview form", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/cif/project-revision");
    cy.get("button").contains("Submit");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "New Project Page",
      variant: "empty",
    });

    cy.findByLabelText(/Primary contact/i).click();
    cy.get("[role=option]").contains("Loblaw003").click();

    // Bad practice
    // But this is a reported issue with mui-autocomplete https://github.com/cypress-io/cypress/issues/6716
    cy.wait(200);

    cy.get("button").contains("Add").click();
    cy.get("button").contains("Add").click();
    cy.get("button").contains("Add").click();
    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);
  });

  it("properly displays validation errors", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/cif/project-revision");

    cy.get("#root_proposalReference").type("1");
    cy.get("button").contains("Submit").click();
    cy.injectAxe();
    // Check error message accessibility
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Page with errors",
      variant: "empty",
    });
    cy.get(".error-detail").should("have.length", 6);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");
  });

  it("Allows to create and update a project", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/cif/project-revision");
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
    cy.contains("Changes saved.");

    cy.findByLabelText(/tech team primary/i).click();
    cy.contains("Swanson").click();
    cy.findByLabelText(/tech team secondary/i).click();
    cy.contains("Ludgate").click();
    cy.findByLabelText(/ops team primary/i).click();
    cy.contains("Knope").click();
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

    cy.findByText("Submit").click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("View").click();
    cy.url().should("include", "/cif/project/");
    cy.useMockedTime(new Date("June 10, 2020 09:00:01"));
    cy.findByText("Edit").click();
    cy.url().should("include", "/cif/project-revision/");

    // Edit the project
    // change the name, delete a manager and contact.
    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Foo")
      .clear()
      .type("Bar");
    cy.contains("Changes saved.");

    cy.findByLabelText(/tech team secondary/i).should(
      "have.value",
      "Ludgate, April"
    );
    cy.get("label")
      .contains("Tech Team Secondary")
      .parent()
      .find("button")
      .contains("Clear")
      .click();
    cy.findByLabelText(/tech team secondary/i).should("not.have.value");
    cy.get("label")
      .contains("Secondary Contacts")
      .parent()
      .find("button")
      .contains("Remove")
      .click();
    cy.wait(1000);
    cy.findByText("Submit").click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("View").click();
    cy.url().should("include", "/cif/project/");
    cy.findByText("Edit").click();
    cy.url().should("include", "/cif/project-revision/");

    // Check the project was updated
    cy.findByLabelText(/Project Name/i).should("have.value", "Bar");
    cy.findByLabelText(/tech team secondary/i).should("not.have.value");
    cy.get("legend")
      .contains("Contacts")
      .parent()
      .find("input")
      .should("have.length", 1);
  });
});
