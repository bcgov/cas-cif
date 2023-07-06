describe("when creating a project, the project page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
  });

  it("allows an admin user to create an EP project", () => {
    //add new
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.happoAndAxe("EP Project New Form", "filled", "main");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // add overview
    cy.url().should("include", "/form/0");
    cy.findByText("Emissions Performance - 2020");
    cy.fillOverviewForm(
      "first operator legal name (AB1234567)",
      "Cement",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project in Progress",
      "Some comments",
      "78.456"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByText("Rank").next().should("have.text", "1");
    cy.happoAndAxe("Project Overview Form", "filled", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();

    // add managers
    cy.url().should("include", "/form/1");
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.contains("Changes saved").should("be.visible");
    cy.wait(1000);
    cy.happoAndAxe("Project manager Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.url().should("include", "/form/2");
    cy.fillContactsForm(
      "Loblaw003",
      "bob.l003@example.com",
      "Loblaw004",
      "bob.l004@example.com"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project Contacts Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");
    // checking default values
    cy.get('[aria-label="Province\'s Share Percentage"]').should(
      "have.value",
      "50.00 %"
    );
    cy.get('[aria-label="Performance Milestone Holdback Percentage"]').should(
      "have.value",
      "10.00 %"
    );

    cy.fillFundingAgreementForm(
      222,
      60,
      333,
      800,
      "2020-01-01",
      "2020-02-02",
      20
    );
    cy.findByText(/Total Project Value$/i)
      .next()
      .should("have.text", "$1,022.00"); // check that calculated value updates
    cy.findByText(/Proponent's Share Percentage$/i)
      .next()
      .should("have.text", "78.27%"); // check that calculated value updates

    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("EP Project budgets Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports
    cy.addMilestoneReport(
      1,
      "desc",
      "General",
      "1991-05-17",
      "Professional Engineer",
      true,
      "2020-01-01"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.get('[aria-label*="Report Due Date"').contains(/Jun(\.)? 16, 1991/i);
    cy.get('[aria-label="Gross Payment Amount This Milestone"]').contains(
      "$60.00"
    );
    cy.get('[aria-label="Net Payment Amount This Milestone"]').contains(
      "$48.00"
    );
    cy.get('[aria-label="Holdback Amount This Milestone"]').contains("$12.00");
    cy.happoAndAxe("Project milestone reports Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add emissions intensity reports
    cy.url().should("include", "/form/5");
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.findByLabelText(/^Functional Unit/i).should("have.value", "tCO2e");
    cy.findAllByText("tCO2e").should("have.length", 4);
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO",
      "1",
      "2",
      "3",
      "G",
      100
    );
    cy.contains(/Duration: 1 month, 1 day/i).should("be.visible");
    cy.contains("Changes saved").should("be.visible");
    cy.findByLabelText("GHG Emission Intensity Performance").should(
      "have.text",
      "200.00%"
    );
    cy.findByLabelText(
      "Payment Percentage of Performance Milestone Amount (%)"
    ).should("have.text", "100.00%");
    cy.findByLabelText("Maximum Performance Milestone Amount").should(
      "have.text",
      "$12.00"
    );
    cy.findByLabelText("Actual Performance Milestone Amount").should(
      "have.text",
      "$12.00"
    );
    cy.happoAndAxe("Emission Intensity Form", "filled", "main");
    cy.findByText(/Submit Emissions Intensity Report/).click();

    // Add Quarterly Reports
    cy.url().should("include", "/form/6");
    cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    cy.addQuarterlyReport(2, "2022-01-01", "2022-02-02", "2nd comment");
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project quarterly reports Form", "filled", "main");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // No annual reports
    cy.url().should("include", "/form/7");
    cy.findByText(/Submit Annual Reports/i).click();

    // Add attachments

    cy.url().should("include", "/form/8");
    cy.get("input[type=file]").selectFile(cy.fixture("e2e/mock.pdf"));
    cy.findByText("mock.pdf").should("be.visible");

    cy.findByText(/Submit project attachments/i).click();
    //review and submit
    cy.contains("Review and Submit Project");

    // project overview section
    cy.findByText(/RFP Year ID/i)
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
    cy.findByText(/Project Description/i)
      .next()
      .should("have.text", "Bar");
    cy.findByText(/Total Funding Request/i)
      .next()
      .should("have.text", "$100.00");
    cy.findByText(/Project Status/i)
      .next()
      .should("have.text", "Project in Progress");
    cy.findAllByText(/General Comments/i)
      .eq(0)
      .next()
      .should("have.text", "Some comments");

    // funding agreement section
    cy.checkFundingAgreementForm(
      true,
      "$222.00",
      "60.00 %",
      "$800.00",
      "70.60%",
      /Jan(\.)? 1, 2020/,
      /Feb(\.)? 2, 2020/,
      "$333.00",
      "$1,133.00",
      "20.00 %"
    );
    // additional funding sources section
    cy.findByText(/Additional Funding Source 1/i).should("be.visible");

    // payment tracker section
    cy.findByText(/Total Net Payment Amount to Date$/i)
      .next()
      .should("have.text", "$48.00");
    cy.findByText(/Total Gross Payment Amount to Date$/i)
      .next()
      .should("have.text", "$60.00");
    cy.findByText(/Total Holdback Amount to Date$/i)
      .next()
      .should("have.text", "$12.00");
    cy.findByText(/Total Eligible Expenses to Date$/i)
      .next()
      .should("have.text", "$100.00");

    // project managers section
    cy.findByText(/tech team primary/i)
      .next()
      .should("have.text", "Ron Swanson");
    cy.findByText(/tech team secondary/i)
      .next()
      .should("have.text", "April Ludgate");
    cy.findByText(/ops team primary/i)
      .next()
      .should("have.text", "Leslie Knope");

    // project contacts section
    cy.contains(/Primary contact/i)
      .next()
      .should("have.text", "Bob003 Loblaw003");
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "Bob004 Loblaw004");

    // TEIMP section
    cy.findByText(/^TEIMP start date/i)
      .next()
      .contains(/Jan(\.)? 1, 2022/)
      .should("be.visible");
    cy.findByText(/TEIMP end date/i)
      .next()
      .next()
      .contains(/Duration: 1 month, 1 day/i);
    cy.findByText(/^Functional Unit/i)
      .next()
      .should("have.text", "tCO");
    cy.findByText(/^Production Functional Unit/i)
      .next()
      .should("have.text", "G");
    // GHG performance uses the ReadOnlyAdjustableCalculatedValueWidget, which has a different HTML structure than the other fields
    cy.findByText("GHG Emission Intensity Performance")
      .next()
      .should(
        "have.text",
        "200.00%GHG Emission Intensity Performance (Adjusted)100%"
      );
    cy.findByText("Payment Percentage of Performance Milestone Amount (%)")
      .next()
      .should("have.text", "100.00%");
    cy.findByText("Maximum Performance Milestone Amount")
      .next()
      .should("have.text", "$12.00");
    cy.findByText("Actual Performance Milestone Amount")
      .next()
      .should("have.text", "$12.00");

    // summary
    cy.happoAndAxe("Project summary Form", "filled", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("TEST-123-12345").should("be.visible");
    // this checks that the project view list shows the milestone report status vs. the other report statuses
    cy.findAllByRole("status").should("have.text", "Complete");

    // cleanup attachments

    cy.request({
      method: "GET",
      url: "http://localhost:3004/delete/WyJhdHRhY2htZW50cyIsMV0=",
      failOnStatusCode: false,
    });
  });

  it("allows an admin user to create an IA project", () => {
    // this test only checks the mandatory and IA-specific forms. The other forms are already tested above in the EP project creation test

    //add new
    cy.fillAndCheckNewProjectForm("Innovation Accelerator", "2021");
    cy.happoAndAxe("IA Project New Form", "filled", "main");
    cy.findByRole("button", { name: /^confirm/i }).click();

    // add overview
    cy.url().should("include", "/form/0");
    cy.findByText("Innovation Accelerator - 2021");

    cy.fillOverviewForm(
      "first operator legal name (AB1234567)",
      "Cement",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project in Progress",
      "Some comments",
      "78.456"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.findByRole("heading", {
      name: /3. Budgets, Expenses & Payments/i,
    }).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");
    // checking default values
    cy.get('[aria-label="Province\'s Share Percentage"]').should(
      "have.value",
      "50.00 %"
    );

    cy.fillFundingAgreementForm(222, 60, 333, 800, "2020-01-01", "2020-02-02");
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("IA Project budgets Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // project summary form
    cy.findByRole("heading", {
      name: /5. Project Summary Report/i,
    }).click();
    cy.findByText(/Add Project Summary Report/i).click();
    cy.findByRole("button", {
      name: /Add Project Summary Report/i,
    }).click();
    cy.addProjectSummaryReport(
      "2020-01-01",
      "2020-01-01",
      "comments",
      "$4,321.00",
      "payment notes",
      "2020-01-01"
    );
    cy.contains(/Complete/i).should("be.visible");
    cy.happoAndAxe("Project Summary Report Form", "filled", "main");
    cy.findByText(/Submit Project Summary/).click();

    //review and submit
    cy.findByRole("heading", {
      name: /7. Submit Changes/i,
    }).click();
    cy.findByText(/Review and Submit information/i).click();
    cy.contains("Review and Submit Project");

    // project overview section
    cy.findByText(/RFP Year ID/i)
      .next()
      .should("have.text", "Innovation Accelerator - 2021");

    // funding agreement section
    cy.checkFundingAgreementForm(
      true,
      "$222.00",
      "60.00 %",
      "$800.00",
      "70.60%",
      /Jan(\.)? 1, 2020/,
      /Feb(\.)? 2, 2020/,
      "$333.00",
      "$1,133.00",
      undefined
    );
    // additional funding sources section
    cy.findByText(/Additional Funding Source 1/i).should("be.visible");

    // payment tracker section
    cy.findByText(/Total Payment Amount to Date$/i)
      .next()
      .should("have.text", "$4,498.60");

    // project summary report section
    cy.contains(/Project Summary Report/i).should("be.visible");
    cy.findByText(/Project Summary Report Payment/i)
      .next()
      .should("have.text", "$4,321.00");
  });

  it("creates new contact and redirects a user back to project contact form and populate project contact form with newly created contact", () => {
    //add new
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();

    cy.findByText(/Project Details/i).click();
    cy.findByText(/Add project contacts/i).click();

    cy.url().should("include", "/form/2");

    cy.findAllByRole("button", { name: /Create new contact/i }).click();

    // Checking multiple query parameters in the url
    cy.url()
      .should("include", "/cif/contact/form")
      .should("include", "projectContactFormId")
      .should("include", "projectId")
      .should("include", "contactIndex")
      .should("include", "projectRevisionRowId")
      .should("include", "connectionString");

    //Add new contact
    cy.get("input[aria-label='Given Name']").as("givenNameInput").click();
    cy.get("@givenNameInput").type("Bob");
    cy.get("input[aria-label='Family Name']").type("Loblaw");
    cy.get("input[aria-label=Email]").type("bob@loblaw.ca");
    cy.get("input[aria-label=Phone]").type("1234567890");
    cy.get("input[aria-label='Company Name']").type("ABC");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Contacts Form", "filled", "main");
    cy.get("button").contains("Submit").click();

    //Back to project contact form
    cy.url().should("include", "/form/2");
    cy.findByLabelText(/primary contact/i).should("have.value", "Bob Loblaw");

    cy.findAllByRole("button", { name: /Create new contact/i }).should(
      "not.exist"
    );
  });

  it("generates quarterly and annual reports automatically", () => {
    //add new
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();
    // add budgets, expenses, and payments
    cy.findByRole("heading", {
      name: /3. Budgets, Expenses & Payments/i,
    }).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.setDateInPicker("Contract Start Date", "2020-01-01");
    cy.setDateInPicker("Project Assets Life End Date", "2024-02-02");
    cy.contains("Changes saved").should("be.visible");

    // add teimp reports
    cy.findByRole("heading", {
      name: /5. Emissions Intensity Report/i,
    }).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.setDateInPicker("TEIMP End Date", "2022-01-01");
    cy.setDateInPicker("Report Due Date", "2020-01-01");
    cy.contains("Changes saved").should("be.visible");

    //generate quarterly reports
    cy.findByRole("heading", { name: /6. Quarterly Reports/i }).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/6");
    cy.findByRole("button", { name: /generate quarterly reports/i }).click();
    cy.get(".reportHeader").should("have.length", 9);
    cy.findAllByText(/^Report Due Date$/i)
      .first()
      .next()
      .contains(/Jan(\.)? 05, 2020/);
    cy.findAllByText(/^Report Due Date$/i)
      .last()
      .next()
      .contains(/Jan(\.)? 05, 2022/);
    cy.findByText(/contract start date/i)
      .next()
      .contains(/Jan(\.)? 1, 2020/);
    cy.findByText(/TEIMP End Date/i)
      .next()
      .contains(/Jan(\.)? 1, 2022/);
    cy.happoAndAxe("Auto-generate quarterly reports", "generated", "main");

    //generate annual reports

    cy.findByRole("heading", { name: /7. Annual reports/i }).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/7");
    cy.findByRole("button", { name: /generate annual reports/i }).click();
    cy.get(".reportHeader").should("have.length", 4);
    cy.findAllByText(/^Report Due Date$/i)
      .first()
      .next()
      .contains(/Jan(\.)? 30, 2022/);
    cy.findAllByText(/^Report Due Date$/i)
      .last()
      .next()
      .contains(/Jan(\.)? 30, 2025/);
    cy.findByText(/Emissions Intensity Report Due Date/i)
      .next()
      .contains(/Jan(\.)? 1, 2020/);
    cy.findByText(/Project Assets Life End Date/i)
      .next()
      .contains(/Feb(\.)? 2, 2024/);
    cy.findAllByText(/^on track$/i).should("have.length", 5);
    cy.happoAndAxe("Auto-generate annual reports", "generated", "main");
  });

  it("Shows customized list of project statuses based on the funding stream", () => {
    //add new project with EP funding stream
    cy.fillAndCheckNewProjectForm("Emissions Performance", "2020");
    cy.findByRole("button", { name: /^confirm/i }).click();

    cy.get("#root_projectStatusId").click();
    cy.findAllByRole("option").then((options) => {
      const actual = [...options].map((option) => option.innerText);
      expect(actual).to.deep.equal([
        "Proposal Submitted",
        "Under Technical Review",
        "Technical Review Complete",
        "Waitlisted",
        "Disqualified",
        "Withdrawn",
        "Not Funded",
        "Funding Agreement Pending",
        "Project in Progress",
        "Amendment Pending",
        "Project in TEIMP",
        "Emissions Intensity Report Pending",
        "Project in Annual Reporting",
        "Emissions Intensity Report Submission",
        "Agreement Terminated",
        "Closed",
      ]);
    });

    // Discard this revision to test the other funding stream
    cy.findByText(/Submit Changes/i).click();

    cy.findByText(/Review and Submit information/i).click();
    cy.contains("Review and Submit Project").should("be.visible");
    cy.findByRole("button", { name: /^discard/i }).click();
    cy.findByText("Proceed").click();
    cy.get("button").contains("Add a Project").click();

    //change project funding stream to IA
    cy.fillAndCheckNewProjectForm("Innovation Accelerator", "2021");
    cy.findByRole("button", { name: /^confirm/i }).click();

    cy.get("#root_projectStatusId").click();
    cy.findAllByRole("option").then((options) => {
      const actual = [...options].map((option) => option.innerText);
      expect(actual).to.deep.equal([
        "Proposal Submitted",
        "Under Technical Review",
        "Technical Review Complete",
        "Waitlisted",
        "Disqualified",
        "Withdrawn",
        "Not Funded",
        "Funding Agreement Pending",
        "Project in Progress",
        "Amendment Pending",
        "Project Summary Report Complete",
        "Agreement Terminated",
        "Closed",
      ]);
    });
  });
});
