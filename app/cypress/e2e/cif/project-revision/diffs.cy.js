describe("the project amendment and revisions page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/010_cif_minimum_project");
    cy.mockLogin("cif_admin");
  });

  xit("makes the min proj", () => {
    cy.visit("/cif/projects");
  });
  it("creates a project with the minimum required information, opens and amendment with no changes, opens a general revision with many changes and commits", () => {
    // open an amendment
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get('[type="radio"]').check("Amendment");
    cy.get(".checkbox").contains("Scope").click();
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");

    // open and fill a general revision
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get('[type="radio"]').check("General Revision");
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");

    // project form

    // cy.findByText(/1. Project Overview/i).click();
    // cy.findByText(/Edit Project Overview/i).click();
    cy.url().should("include", "/form/0");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add managers
    cy.findByText(/project details/i).click();
    cy.findByText(/edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.url().should("include", "/form/1");
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.contains("Changes saved").should("be.visible");
    cy.wait(1000);
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.findByText(/general revision 2/i).click();
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/edit project contacts/i).click();
    cy.url().should("include", "/form/2");
    cy.url().should("include", "/form/2");
    cy.fillContactsForm(
      "Loblaw003",
      "bob.l003@example.com",
      "Loblaw004",
      "bob.l004@example.com"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.wait(500);
    cy.findByRole("button", { name: /^3. budgets+/i }).click();
    cy.findByText(/edit budgets+/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");

    cy.fillFundingAgreementForm(
      222,
      60,
      333,
      800,
      "2020-01-01",
      "2020-02-02",
      20
    );
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports
    cy.wait(500);
    cy.findByRole("button", { name: /^4.+/i }).click();
    cy.findByText(/edit milestone+/i).click();
    cy.url().should("include", "/form/4");
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
    cy.findByRole("button", { name: /^submit/i }).click();

    // add emissions intensity reports
    cy.findByRole("button", { name: /^5.+/i }).click();
    cy.findByText(/edit emissions+/i).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", {
      name: /add emissions intensity report/i,
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
    cy.contains(/Duration: 1 month, 1 day/i).should("be.visible");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/Submit Emissions Intensity Report/).click();

    // Add Quarterly Reports
    cy.findByRole("button", { name: /^6.+/i }).click();
    cy.findByText(/edit quarterly+/i).click();
    cy.url().should("include", "/form/6");
    cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    cy.addQuarterlyReport(2, "2022-01-01", "2022-02-02", "2nd comment");
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // Add Annual reports
    // cy.findByRole("button", { name: /^7.+/i }).click();
    // cy.findByText(/edit annual+/i).click();
    // cy.url().should("include", "/form/7");
    // cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    // cy.contains("Changes saved").should("be.visible");
    // cy.findByText(/Submit Annual Reports/i).click();

    //review and submit
    cy.contains(/general revision 2/i);
    cy.screenshot("diffs just before committing general revision 2");

    // committing
    cy.findAllByRole("button", { name: /update/i })
      .first()
      .as("revisionStatusUpdateButton");
    cy.get("@revisionStatusUpdateButton").should("be.disabled");
    cy.get('[aria-label="Status"]').select("Applied");
    cy.get("@revisionStatusUpdateButton").should("not.be.disabled");
    cy.get("@revisionStatusUpdateButton").click();
  });

  xit("creates a project with the minimum required information, opens and amendment with no changes, opens a general revision with many changes and commits, returns to the amendment and makes changes", () => {
    // open an amendment
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get('[type="radio"]').check("Amendment");
    cy.get(".checkbox").contains("Scope").click();
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");

    // open and fill a general revision
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get('[type="radio"]').check("General Revision");
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");

    // project form

    cy.url().should("include", "/form/0");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add managers
    cy.findByText(/project details/i).click();
    cy.findByText(/edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.url().should("include", "/form/1");
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.contains("Changes saved").should("be.visible");
    cy.wait(1000);
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.findByText(/general revision 2/i).click();
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/edit project contacts/i).click();
    cy.url().should("include", "/form/2");
    cy.url().should("include", "/form/2");
    cy.fillContactsForm(
      "Loblaw003",
      "bob.l003@example.com",
      "Loblaw004",
      "bob.l004@example.com"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.wait(500);
    cy.findByRole("button", { name: /^3. budgets+/i }).click();
    cy.findByText(/edit budgets+/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.contains("Changes saved").should("be.visible");

    cy.fillFundingAgreementForm(
      222,
      60,
      333,
      800,
      "2020-01-01",
      "2020-02-02",
      20
    );
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports
    cy.wait(500);
    cy.findByRole("button", { name: /^4.+/i }).click();
    cy.findByText(/edit milestone+/i).click();
    cy.url().should("include", "/form/4");
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
    cy.findByRole("button", { name: /^submit/i }).click();

    // add emissions intensity reports
    cy.findByRole("button", { name: /^5.+/i }).click();
    cy.findByText(/edit emissions+/i).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", {
      name: /add emissions intensity report/i,
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
    cy.contains(/Duration: 1 month, 1 day/i).should("be.visible");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/Submit Emissions Intensity Report/).click();

    // Add Quarterly Reports
    cy.findByRole("button", { name: /^6.+/i }).click();
    cy.findByText(/edit quarterly+/i).click();
    cy.url().should("include", "/form/6");
    cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    cy.addQuarterlyReport(2, "2022-01-01", "2022-02-02", "2nd comment");
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // Add Annual reports
    // cy.findByRole("button", { name: /^7.+/i }).click();
    // cy.findByText(/edit annual+/i).click();
    // cy.url().should("include", "/form/7");
    // cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    // cy.contains("Changes saved").should("be.visible");
    // cy.findByText(/Submit Annual Reports/i).click();

    //review and submit
    cy.contains(/general revision 2/i);
    cy.screenshot("diffs just before committing general revision 2");

    // committing
    cy.findAllByRole("button", { name: /update/i })
      .first()
      .as("revisionStatusUpdateButton");
    cy.get("@revisionStatusUpdateButton").should("be.disabled");
    cy.get('[aria-label="Status"]').select("Applied");
    cy.get("@revisionStatusUpdateButton").should("not.be.disabled");
    cy.get("@revisionStatusUpdateButton").click();
    cy.screenshot("diffs just after committing general revision 2");
    cy.findByText(/error/i).should("be.visible");
    cy.pause();
    ////
    ///
    ////
    ////
    // change stuff in the new amendment
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.url().should("include", "/form/0");
    cy.findByRole("button", { name: /view \/ edit/i }).click();

    // change managers
    cy.wait(1000);
    cy.pause();
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.url().should("include", "/form/1");
    cy.fillManagersForm("Ludgate", "Knope", "Swanson");
    cy.contains("Changes saved").should("be.visible");
    cy.wait(1000);
    cy.findByRole("button", { name: /^submit/i }).click();

    // change contacts
    cy.findByText(/general revision 2/i).click();
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/edit project contacts/i).click();
    cy.url().should("include", "/form/2");
    cy.url().should("include", "/form/2");
    cy.fillContactsForm(
      "Loblaw009",
      "bob.l009@example.com",
      "Loblaw010",
      "bob.l010@example.com"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
  });
});
