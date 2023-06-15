import { aliasOperation } from "../../../utils/graphql-test-utils";

describe("the new project page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("renders the EP unfilled project forms", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    // NEW
    cy.url().should("include", "/new");
    cy.findByLabelText(/Funding Stream$/i).should("be.visible");
    cy.happoAndAxe("Project New Form", "unfilled", "main");
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // OVERVIEW
    cy.url().should("include", "/form/0");
    cy.get("button").contains("Submit Project Overview");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project Overview Form", "empty", "main", true);

    //PROJECT DETAILS
    cy.findByText(/Project Details/i).click();
    // MANAGERS
    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/1");

    cy.findByRole("link", { name: /^Add project overview$/i }).should(
      "be.visible"
    );
    cy.contains("Attention Required").should("be.visible");
    cy.happoAndAxe("Project Managers Form", "empty", "main");

    // CONTACTS
    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 2);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 3);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);

    cy.happoAndAxe("Project Contacts Form", "empty", "main");
    cy.findByText(/Submit project contacts/i).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains(/^Budgets, expenses & payments/i);
    cy.happoAndAxe("EP Project budgets Form", "empty", "main");
    // checking default values
    cy.get('[aria-label="Province\'s Share Percentage"]').should(
      "have.value",
      "50.00 %"
    );
    cy.get('[aria-label="Performance Milestone Holdback Percentage"]').should(
      "have.value",
      "10.00 %"
    );

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.contains("Changes saved.").should("be.visible");
    cy.findByText("Milestone Reports").should("be.visible");
    cy.findByText("In Progress").should("not.exist");
    cy.happoAndAxe("Project milestone Form", "empty", "main");

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.contains("Generate reports");
    cy.findByRole("button", { name: /generate quarterly reports/i }).should(
      "be.disabled"
    );
    cy.contains("Changes saved.").should("be.visible");
    cy.findByText("Add Budgets, Expenses & Payments").should("be.visible");
    cy.findByText("Add Milestone Reports").should("not.exist");
    cy.happoAndAxe("Project Quarterly Reports Form", "empty", "main");

    // Emissions Intensity Report
    cy.findByText(/Emissions Intensity Report/i).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.findByRole("button", {
      name: /Add emissions intensity report/i,
    }).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Emissions Intensity Report", "empty", "main");

    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.contains("Changes saved.").should("be.visible");
    cy.findByText("Annual Reports").should("be.visible");
    cy.findByText("Add Annual Reports")
      .next()
      .should("have.text", "Not Started");
    cy.findByText("Add Emissions Intensity Report").should("not.exist");
    cy.happoAndAxe("Project Annual Reports Form", "empty", "main");

    // SUMMMARY
    cy.findByText(/Submit Changes/i).click();
    cy.findByText(/Review and Submit information/i).click();
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.findByText(/milestone reports not added/i).should("be.visible");
    cy.findByText(/quarterly reports not added/i).should("be.visible");
    cy.findByText(/annual reports not added/i).should("be.visible");
    cy.findByText(/Performance Milestone Holdback Percentage/i).should(
      "be.visible"
    );

    cy.happoAndAxe("EP Project summary Form", "empty", "main", true);
  });

  it("renders the IA-specific unfilled project forms", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    // NEW
    cy.url().should("include", "/new");
    cy.findByLabelText(/Funding Stream$/i).should("be.visible");
    cy.fillAndCheckNewProjectForm("Innovation Accelerator", "2021");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains(/^Budgets, expenses & payments/i);
    // Screenshot below is commented out because of flakiness. Documented in ticket #1194.
    // cy.happoAndAxe("IA Project budgets Form", "empty", "main");
    // checking default values
    cy.get('[aria-label="Province\'s Share Percentage"]').should(
      "have.value",
      "50.00 %"
    );

    // PROJECT SUMMARY REPORT
    cy.findByText(/Project summary report/i).click();
    cy.findByText(/Add Project Summary Report/i).click();
    cy.findByRole("button", { name: /Add Project Summary Report/i }).should(
      "be.visible"
    );
    cy.url().should("include", "/form/5");

    // SUMMMARY
    cy.findByText(/Submit Changes/i).click();
    cy.findByText(/Review and Submit information/i).click();
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.findByText(/milestone reports not added/i).should("be.visible");
    cy.findByText(/Performance Milestone Holdback Percentage/i).should(
      "not.exist"
    );
    cy.findByText(/project summary report not added/i).should("be.visible");

    cy.happoAndAxe("IA Project summary Form", "empty", "main", true);
  });

  it("renders filled EP project forms in view mode for committed project revisions", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /^view$/i })
      .first()
      .click();
    cy.url().should("include", "/form/0");

    cy.findByRole("heading", { name: "3. Submit changes" }).should("not.exist");
    cy.findByRole("link", { name: "Project Overview" })
      .next()
      .should("not.exist");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/RFP Year ID/i)
      .next()
      .should("have.text", "Emissions Performance - 2019");
    cy.findByText(/Project Details/i).click();
    cy.findByRole("link", { name: "Project Managers" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project Managers" }).click();
    cy.url().should("include", "/form/1");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText("Tech Team Primary (optional)")
      .next()
      .should("have.text", "cif_internal Testuser");
    cy.findByRole("link", { name: "Project Contacts" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project Contacts" }).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Primary Contact/).should("be.visible");

    // budgets, expenses, and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByRole("link", { name: "Budgets, Expenses & Payments" }).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.checkFundingAgreementForm(
      false,
      "$1.00",
      "50.00 %",
      "$777.00",
      "99.87%",
      /Jun(\.)? 10, 2020/,
      /Jun(\.)? 10, 2020/,
      "$1.00",
      "$778.00",
      "10.00 %"
    );
    // additional funding sources
    cy.findByText(/Additional Funding Source 1/i).should("be.visible");

    //TODO: TEIMP Agreement, when fixture is added

    cy.findByRole("heading", { name: /Annual reports/i }).click();
    cy.findByRole("link", { name: /Annual reports/i }).click();
    cy.url().should("include", "/form/7");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Annual Report 1/);
  });

  it("renders filled IA-specific project forms in view mode for committed project revisions", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("input[aria-label='Filter by Proposal Reference']").as("inpt");
    cy.get("@inpt").type("IA{enter}");
    cy.findByText("IA001").should("be.visible");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.url().should("include", "/form/0");

    // filter by "IA"
    cy.findByRole("heading", { name: "3. Submit changes" }).should("not.exist");
    cy.findByText(/RFP Year ID/i)
      .next()
      .should("have.text", "Innovation Accelerator - 2021");

    // budgets, expenses, and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByRole("link", { name: "Budgets, Expenses & Payments" }).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.checkFundingAgreementForm(
      false,
      "$500.00",
      "50.00 %",
      "$3,000.00",
      "75.00%",
      /Jun(\.)? 10, 2020/,
      /Jun(\.)? 10, 2020/,
      "$200.00",
      "$4,000.00",
      undefined
    );
    // additional funding sources
    cy.findByText(/Additional Funding Source 1/i).should("be.visible");

    cy.contains(/Total Payment Amount to Date/i)
      .next()
      .contains(/511/i);

    // project summary report
    cy.findByRole("heading", {
      name: /5. Project Summary Report/i,
    }).click();
    cy.findByRole("link", { name: "Project Summary Report" }).click();
    cy.url().should("include", "form/5");

    cy.checkProjectSummaryReport(
      /Jun(\.)? 10, 2020/,
      /Jun(\.)? 10, 2020/,
      "project summary report comments 51",
      "$111.00",
      "payment notes",
      /Jun(\.)? 10, 2020/
    );
  });

  it("properly displays validation errors for EP projects", () => {
    // load more projects to trigger unique proposal reference error
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    // NEW
    cy.url().should("include", "/new");
    cy.findByRole("button", { name: /^confirm/i }).click();
    cy.happoAndAxe("Project New Form", "with errors", ".error-detail", true);
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // OVERVIEW
    cy.url().should("include", "/form/0");
    cy.findByText(/Emissions Performance/i).should("be.visible");
    cy.findByLabelText(/Proposal Reference/i).type("EP001");
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit Project Overview").click();
    cy.contains("Changes saved").should("be.visible");
    cy.contains(
      "This proposal reference already exists, please specify a different one."
    ).should("be.visible");
    cy.happoAndAxe(
      "Project overview Form",
      "with errors",
      ".error-detail",
      true
    );
    cy.get(".error-detail").should("have.length", 7);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");

    cy.findByText(/Project Details/i).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 5);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "EP Project funding agreement Form",
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
    cy.get(".error-detail").should("have.length", 4);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project milestone reports Form",
      "with errors",
      ".error-detail"
    );

    // Emissions intensity report
    cy.findByText(/Emissions Intensity Report/i).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.url().should("include", "/form/5");
    cy.intercept("POST", "http://localhost:3004/graphql", (req) => {
      aliasOperation(req, "stageEmissionIntensityFormChangeMutation");
      aliasOperation(req, "stageReportingRequirementFormChangeMutation");
    });
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.contains("Changes saved").should("be.visible");

    cy.findByRole("button", { name: /^submit/i }).click();
    cy.wait("@gqlstageEmissionIntensityFormChangeMutation")
      .its("response")
      .should("have.property", "body");
    cy.wait("@gqlstageReportingRequirementFormChangeMutation")
      .its("response")
      .should("have.property", "body");
    cy.get(".error-detail").should("have.length", 4);
    cy.contains("Changes saved").should("be.visible");
    // temporarily removing this flaky screenshot until a permanent fix is in place
    // cy.happoAndAxe(
    //   "Emissions intensity report Form",
    //   "with errors",
    //   ".error-detail"
    // );

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/6");

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
      "Project Quarterly Reports Form",
      "with errors",
      ".error-detail"
    );

    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/7");
    cy.findByRole("button", { name: /add another annual report/i }).click();
    cy.findByRole("status").first().should("have.text", "On track");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project Annual Reports Form",
      "with errors",
      ".error-detail"
    );
  });

  it("properly displays validation errors for IA-specific forms", () => {
    // load more projects to trigger unique proposal reference error
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    // NEW
    cy.url().should("include", "/new");
    cy.findByRole("button", { name: /^confirm/i }).click();
    cy.fillAndCheckNewProjectForm("Innovation Accelerator", "2021");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // BUDGETS, EXPENSES AND PAYMENTS
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 5);
    cy.contains("Changes saved").should("be.visible");
    // Screenshot below is commented out because of flakiness. Documented in ticket #1194.
    // cy.happoAndAxe(
    //   "IA Project funding agreement Form",
    //   "with errors",
    //   ".error-detail"
    // );
  });
});
