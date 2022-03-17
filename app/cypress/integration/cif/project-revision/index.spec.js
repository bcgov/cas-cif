import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/004_cif_contact");
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
    cy.contains("Changes saved.");

    cy.findByLabelText(/Total Funding Request/i).type("100");
    cy.contains("Changes saved.");

    cy.findByLabelText(/Summary/i).type("Bar");
    cy.contains("Changes saved.");

    cy.findByLabelText(/Operator Name/i).click();
    cy.contains("first operator").click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/Funding Stream$/i).select("Emissions Performance");
    cy.contains("Changes saved.");

    cy.findByLabelText(/Funding Stream RFP/i).select("2020");
    cy.contains("Changes saved.");

    cy.findByLabelText(/Project Status/i).select("Project Underway");
    cy.contains("Changes saved.");

    cy.findByLabelText(/Proposal Reference/i).type("TEST-123-12345");
    cy.contains("Changes saved.");

    cy.findByLabelText(/tech team primary/i).click();
    cy.contains("Swanson").click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/tech team secondary/i).click();
    cy.contains("Ludgate").click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/ops team primary/i).click();
    cy.contains("Knope").click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/Primary contact/i).click();
    cy.contains("Loblaw003").click();
    cy.contains("Changes saved.");

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
      "April Ludgate"
    );
    cy.get("label")
      .contains("Tech Team Secondary")
      .parent()
      .find("button")
      .contains("Clear")
      .click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/tech team secondary/i).should("not.have.value");
    cy.get("label")
      .contains("Secondary Contacts")
      .parent()
      .find("button")
      .contains("Remove")
      .click();
    cy.contains("Changes saved.");

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
