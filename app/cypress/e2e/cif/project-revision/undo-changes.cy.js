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
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();

    cy.fillOverviewForm(
      "first operator legal name (AB1234567)",
      "Cement",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project in Progress",
      "Some comments",
      "65.432"
    );
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkOverviewForm("", "", "", "", "", "", "", "");

    cy.findByText(/Project Details/i).click();

    // undo managers
    cy.findByText(/Add project managers/i).click();
    cy.fillManagersForm("Ron Swanson", "April Ludgate", "Leslie Knope");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkManagersForm("", "", "");

    // undo contacts
    cy.findByText(/Add project contacts/i).click();
    cy.fillContactsForm(
      "Loblaw003",
      "bob.l003@example.com",
      "Loblaw004",
      "bob.l004@example.com"
    );
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkContactsForm("", "");

    // undo budgets, expenses and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.fillFundingAgreementForm(
      333,
      70,
      444,
      777,
      "2020-01-01",
      "2020-12-31",
      20
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Yes/i).should("be.visible");
    cy.findAllByRole("link", { name: /^Add budgets/i })
      .next()
      .should("have.text", "Not Started");

    // undo additional funding source
    cy.findByText(/Yes/i).click();
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm(
      "Test Additional Source",
      123,
      "Approved",
      1
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText("Test Additional Source").should("not.exist");
    cy.findByText("Approved").should("not.exist");
    cy.findByText(/Yes/i).should("be.visible");

    // undo TEIMP agreement
    cy.findByText(/Emissions intensity report/i).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO",
      "1",
      "2",
      "3",
      "G"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByRole("button", { name: /Add Emissions Intensity Report/i }).should(
      "be.visible"
    );
    cy.findAllByRole("link", { name: /^Add emissions intensity report/i })
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
      "Professional Engineer",
      true
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Milestone Report 1/i).should("not.exist");
    cy.get('[label*="Due Date"]').should("have.length", 0);
  });

  it("undoes changes on an existing project when the user clicks the Undo Changes button", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");

    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
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

    cy.findByLabelText(/Proposal Reference/i).should("have.value", "EP001");

    // undo managers
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project managers/i).click();
    cy.findByLabelText(/tech team primary/i).click();
    cy.contains(/Ron Swanson/).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "Ron Swanson"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "cif_internal Testuser"
    );

    // undo contacts
    cy.findByText(/Edit project contacts/i).click();
    cy.findByLabelText(/Primary contact/i).click();
    cy.contains(/Bob006 Loblaw006/).click();
    cy.findByLabelText(/Primary contact/i).should(
      "have.value",
      "Bob006 Loblaw006"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.contains("Changes saved.");
    cy.findByLabelText(/Primary contact/i).should(
      "have.value",
      "Bob001 Loblaw001"
    );

    // undo budgets, expenses and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Edit budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.fillFundingAgreementForm(
      333,
      70,
      444,
      900,
      "2020-01-01",
      "2020-12-31",
      30
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.contains("Changes saved.");
    cy.findByLabelText(/Maximum Funding Amount/i).should("have.value", "$1.00");
    cy.findByLabelText(/Proponent Cost/i).should("have.value", "$777.00");

    // undo additional funding source
    cy.fillAdditionalFundingSourceForm("I will be undone", 2000, "Approved", 1);
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.contains("Changes saved.").should("be.visible");
    cy.findByLabelText(/Additional Funding Source/i).should(
      "have.value",
      "cheese import taxes"
    );
    cy.findByLabelText(/Additional Funding Amount/i).should(
      "have.value",
      "$1,000.00"
    );
    cy.findByLabelText(/Additional Funding Status/i).should(
      "have.value",
      "Awaiting Approval"
    );

    // undo milestone reports
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Edit milestone 1/i).click();
    cy.get("h3")
      .contains(/Milestone 1/i)
      .click();
    cy.findByLabelText(/milestone description/i)
      .click()
      .clear();
    cy.findByLabelText(/milestone description/i).type("I will be undone");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByLabelText(/milestone description/i).should(
      "have.text",
      "general milestone report description 1"
    );

    // undo TEIMP agreement
    cy.findByText(/Emissions Intensity Report/i).click();
    cy.findByText(/Edit Emissions Intensity Report/i)
      .should("be.visible")
      .click();
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO",
      "1",
      "2",
      "3",
      "G"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByRole("button", { name: /Add Emissions Intensity Report/i }).should(
      "be.visible"
    );

    // undo quarterly reports
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.findByText(/Quarterly report 1/i).click();
    cy.findByLabelText(/General Comments/i)
      .click()
      .clear();
    cy.findByLabelText(/General Comments/i).type("I will be undone");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByLabelText(/General Comments/i).should(
      "have.text",
      "quarterly report comments 1"
    );

    // undo annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Edit annual reports/i).click();
    cy.findByText(/annual report 1/i).click();
    cy.findByLabelText(/General Comments/i)
      .click()
      .clear();
    cy.findByLabelText(/General Comments/i).type("I will be undone");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByLabelText(/General Comments/i).should(
      "have.text",
      "annual report comments 1"
    );
  });
});
