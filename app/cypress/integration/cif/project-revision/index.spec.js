describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("renders the unfilled project forms", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/0");

    // OVERVIEW
    cy.get("button").contains("Submit Project Overview");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project Overview Form", "empty", "main");

    //PROJECT DETAILS
    cy.findByText(/Project Details/i).click();

    // MANAGERS
    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.happoAndAxe("Project managers Form", "empty", "main");

    // CONTACTS
    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 2);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 3);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);

    cy.happoAndAxe("Project contacts Form", "empty", "main");
    cy.findByText(/Submit contacts/i).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add funding agreement/i).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /add funding agreement/i }).click();
    cy.fillFundingAgreementForm(111, 222, 60, 20, 333);
    cy.happoAndAxe("Project budgets Form", "empty", "main");

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project milestone Form", "empty", "main");

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project quarterly reports Form", "empty", "main");

    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project annual reports Form", "empty", "main");

    // SUMMMARY
    cy.findByText(/Submit Changes/i).click();
    cy.findByText(/review and submit information/i).click();
    cy.findByText(/project overview not added/i).should("be.visible");
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.findByText(/milestone reports not added/i).should("be.visible");
    cy.findByText(/quarterly reports not added/i).should("be.visible");
    // TODO: add below assertion back in when bug is fixed
    // cy.findByText(/annual reports not added/i).should("be.visible");

    cy.happoAndAxe("Project summary Form", "empty", "main", true);
  });

  it("renders filled project forms in view mode for committed project revisions", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.url().should("include", "/form/0");

    cy.findByRole("heading", { name: "3. Submit changes" }).should("not.exist");
    cy.findByRole("link", { name: "Project overview" })
      .next()
      .should("not.exist");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Funding Stream RFP ID/i)
      .next()
      .should("have.text", "Emissions Performance - 2019");
    cy.findByText(/Project Details/i).click();
    cy.findByRole("link", { name: "Project managers" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project managers" }).click();
    cy.url().should("include", "/form/1");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText("Tech Team Primary (optional)")
      .next()
      .should("have.text", "Testuser, cif_internal");
    cy.findByRole("link", { name: "Project contacts" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project contacts" }).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    //TODO: if contacts are added to the dev data projects, change below assertion
    cy.findByText(/Primary contact not added/).should("be.visible");

    // budgets, expenses, and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/funding agreement/i).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.checkFundingAgreementForm("$1.00", "$1.00", 50, 10, "$1.00");

    cy.findByRole("heading", { name: /Annual reports/i }).click();
    cy.findByRole("link", { name: /Annual reports/i }).click();
    cy.url().should("include", "/form/6");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Annual Report 1/);
  });

  it("properly displays validation errors", () => {
    // load more projects to trigger unique proposal reference error
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");

    // OVERVIEW
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/0");
    cy.findByLabelText(/Proposal Reference/i).type("001");
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit Project Overview").click();
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project overview Form", "with errors", ".error-detail");
    cy.get(".error-detail").should("have.length", 8);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");

    cy.findByText(/Project Details/i).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add funding agreement/i).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /add funding agreement/i }).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 3);
    cy.happoAndAxe(
      "Project funding agreement Form",
      "with errors",
      ".error-detail"
    );

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.url().should("include", "/form/4");
    cy.findByText(/Add another milestone report/i).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 2);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project milestone reports Form",
      "with errors",
      ".error-detail"
    );

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/5");

    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.findAllByRole("status").first().should("have.text", "On track");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 3);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project quarterly reports Form",
      "with errors",
      ".error-detail"
    );

    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/6");
    cy.findByRole("button", { name: /add another annual report/i }).click();
    cy.findByRole("status").first().should("have.text", "On track");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project annual reports Form",
      "with errors",
      ".error-detail"
    );
  });
});
