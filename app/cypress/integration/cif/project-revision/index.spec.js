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
    cy.findByText(/Add project overview/i)
      .next()
      .should("have.text", "Attention Required");
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
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Project Funding Agreement");
    cy.happoAndAxe("Project budgets Form", "empty", "main");
    // checking default values
    cy.get('[aria-label="Province Share Percentage"]').should(
      "have.value",
      "50 %"
    );
    cy.get('[aria-label="Holdback Percentage"]').should("have.value", "10 %");

    cy.fillFundingAgreementForm(
      111,
      222,
      60,
      20,
      333,
      777,
      "2020-01-01",
      "2020-12-31"
    );

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project milestone Form", "empty", "main");

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.contains("Generate reports");
    cy.findByRole("button", { name: /generate quarterly reports/i }).should(
      "be.disabled"
    );
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project quarterly reports Form", "empty", "main");

    // Emissions Intensity Report
    cy.findByText(/Emissions Intensity Report/i).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.findByText(/Add TEIMP Agreement/i).click();
    cy.contains("Changes saved.");
    cy.happoAndAxe("Emissions Intensity Report", "empty", "main");

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
    cy.findByText(/annual reports not added/i).should("be.visible");

    cy.happoAndAxe("Project summary Form", "empty", "main", true);
  });

  it("renders filled project forms in view mode for committed project revisions", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.sqlFixture("dev/008_cif_additional_funding_source");
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
      .should("have.text", "cif_internal Testuser");
    cy.findByRole("link", { name: "Project contacts" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project contacts" }).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Primary Contact/).should("be.visible");

    // budgets, expenses, and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByRole("link", { name: "Budgets overview" }).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.checkFundingAgreementForm(
      "$1.00",
      "$1.00",
      "50 %",
      "10 %",
      "$1.00",
      "$777.00",
      /Jun(\.)? 10, 2020/,
      /Jun(\.)? 10, 2020/
    );
    // additional funding sources
    cy.checkAdditionalFundingSourceForm(
      "cheese import taxes",
      "$1,000.00",
      "Awaiting Approval",
      1
    );

    //TODO: TEIMP Agreement, when fixture is added

    cy.findByRole("heading", { name: /Annual reports/i }).click();
    cy.findByRole("link", { name: /Annual reports/i }).click();
    cy.url().should("include", "/form/7");
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
    cy.happoAndAxe(
      "Project overview Form",
      "with errors",
      ".error-detail",
      true
    );
    cy.get(".error-detail").should("have.length", 8);
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
    cy.get(".error-detail").should("have.length", 6);
    cy.contains("Changes saved").should("be.visible");
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
    cy.get(".error-detail").should("have.length", 3);
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

    // Emissions intensity report
    cy.findByText(/Emissions Intensity Report/i).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.url().should("include", "/form/6");
    cy.intercept("POST", "http://localhost:3004/graphql", (req) => {
      aliasOperation(req, "stageEmissionIntensityFormChangeMutation");
      aliasOperation(req, "stageReportingRequirementFormChangeMutation");
    });
    cy.findByRole("button", {
      name: /Add TEIMP /i,
    }).click();
    cy.contains("Changes saved").should("be.visible");

    cy.findByRole("button", { name: /^submit/i }).click();
    cy.wait("@gqlstageEmissionIntensityFormChangeMutation");
    cy.wait("@gqlstageReportingRequirementFormChangeMutation");
    cy.get(".error-detail").should("have.length", 4);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Emissions intensity report Form",
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
      "Project annual reports Form",
      "with errors",
      ".error-detail"
    );
  });
});
