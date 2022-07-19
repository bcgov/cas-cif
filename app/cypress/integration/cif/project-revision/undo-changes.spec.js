describe("when undoing, the project revision page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
  });

  it("undoes changes on a new project when the user clicks the Undo Changes button", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");

    cy.get("button").contains("Add a Project").click();
    cy.fillOverviewForm(
      "Emissions Performance",
      "2020",
      "first operator legal name (AB1234567)",
      "Cement",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project Underway",
      "Some comments"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkOverviewForm(
      "Select a Funding Stream",
      "Select a Funding Stream RFP Year",
      "",
      "",
      "",
      "",
      "",
      "Select a Project Status",
      ""
    );

    cy.findByText(/Project Details/i).click();

    // undo managers
    cy.findByText(/Add project managers/i).click();
    cy.fillManagersForm("Swanson, Ron", "Ludgate, April", "Knope, Leslie");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkManagersForm("", "", "");

    // undo contacts
    cy.findByText(/Add project contacts/i).click();
    cy.fillContactsForm("Loblaw003", "Loblaw004");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkContactsForm("", "");

    // undo budgets, expenses and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add funding agreement/i).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /add funding agreement/i }).click();
    cy.fillFundingAgreementForm(222, 333, 70, 20, 444);
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByRole("button", { name: /add funding agreement/i }).should(
      "be.visible"
    );
    cy.findAllByRole("link", { name: /^Add funding agreement/i })
      .next()
      .should("have.text", "Not Started");

    // undo quarterly reports
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.get('[aria-label="General Comments"]').clear().type("I ");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Quarterly Report 1/i).should("not.exist");
    cy.get('[label*="Due Date"]').should("have.length", 0);

    // undo annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.addAnnualReport(1, "2000-05-05", "2000-07-23");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Annual Report 1/i).should("not.exist");

    // undo milestone reports
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.addMilestoneReport(
      1,
      "I am a description",
      "General",
      "1990-08-12",
      "1991-04-17",
      "Professional Engineer"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Milestone Report 1/i).should("not.exist");
    cy.get('[label*="Due Date"]').should("have.length", 0);
  });

  it("undoes changes on an existing project when the user clicks the Undo Changes button", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");

    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByRole("button", { name: /edit/i }).click();

    //undo overview
    cy.findByLabelText(/Proposal Reference/i)
      .clear()
      .type("I will be undone");
    cy.findByLabelText(/Proposal Reference/i).should(
      "have.value",
      "I will be undone"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.contains("Changes saved.");

    cy.findByLabelText(/Proposal Reference/i).should("have.value", "001");

    // undo managers
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project managers/i).click();
    cy.findByLabelText(/tech team primary/i).click();
    cy.contains(/Swanson, Ron/).click();
    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "Swanson, Ron"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.contains("Changes saved.");
    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "Testuser, cif_internal"
    );

    // undo contacts
    // TODO: add this test back in once undoing contacts bug is fixed
    // cy.findByText(/Edit project contacts/i).click();
    // cy.findByLabelText(/Primary contact/i).click();
    // cy.contains(/Loblaw006, Bob006/).click();
    // cy.findByLabelText(/Primary contact/i).should(
    //   "have.value",
    //   "Loblaw006, Bob006"
    // );
    // cy.findByRole("button", { name: /undo changes/i }).click();
    // cy.findByRole("button", { name: /undo changes/i }).click();
    // cy.contains("Changes saved.");
    // cy.wait(2000);
    // cy.findByLabelText(/Primary contact/i).should("have.value", "");

    // undo quarterly reports
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.findByText(/Quarterly report 1/i).click();
    cy.get('[aria-label="General Comments"]').clear().type("I will be undone");

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.get('[aria-label="General Comments"]').should(
      "have.text",
      "quarterly report comments 1"
    );

    // undo annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Edit annual reports/i).click();
    cy.findByText(/annual report 1/i).click();
    cy.get('[aria-label="General Comments"]').clear().type("I will be undone");

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.get('[aria-label="General Comments"]').should(
      "have.text",
      "annual report comments 1"
    );

    // undo milestone reports
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Edit milestone 1/i).click();
    cy.get("h3")
      .contains(/Milestone 1/i)
      .click();
    cy.get('[aria-label*="Description"]').clear().type("I will be undone");

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.get('[aria-label*="Description"]').should(
      "have.text",
      "general milestone report description 1"
    );
  });
});
