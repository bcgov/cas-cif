import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("renders the project forms", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/0");

    // OVERVIEW
    cy.get("button").contains("Submit Project Overview");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    const tempRules = {
      rules: {
        dlitem: { enabled: false },
        "definition-list": { enabled: false },
      },
    };
    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "empty",
    });
    cy.findByText(/Project Details/i).click();

    // MANAGERS
    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.injectAxe();
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Managers Form",
      variant: "empty",
    });

    // CONTACTS
    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 2);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.get("fieldset input").should("have.length", 3);
    cy.findByRole("button", { name: /add a secondary contact/i }).click();

    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Contacts Form",
      variant: "empty",
    });
    cy.findByText(/Submit contacts/i).click();

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.findByText(/Add another milestone report/i).click();

    cy.url().should("include", "/form/3");

    cy.get('[aria-label="Milestone Description"]').clear().type("desc");
    cy.get('[aria-label="Milestone Description"]').should("have.value", "desc");
    cy.addDueDate(0, "2020-01-01");
    cy.get('label[for*="reportDueDate"]').should("have.length", 1);
    cy.setReportReceivedDate(0, "2019-12-31");
    cy.findAllByRole("status").first().should("have.text", "Complete");

    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Milestone Reports Form",
      variant: "filled",
    });

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();

    cy.url().should("include", "/form/4");

    cy.addQuarterlyReport(1, "1991-01-01", "1990-12-31");
    cy.contains("Changes saved").should("be.visible");
    cy.addQuarterlyReport(2, "1992-01-01", "1991-12-31");
    cy.contains("Changes saved").should("be.visible");
    cy.addQuarterlyReport(3, "1993-01-01", "1992-12-31");
    cy.contains("Changes saved").should("be.visible");
    cy.findAllByRole("status").first().should("have.text", "Complete");

    cy.get('label[for*="reportDueDate"]').should("have.length", 3);
    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Quarterly Reports Form",
      variant: "filled",
    });

    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/5");
    cy.addAnnualReport(1, "1991-01-01", "1990-12-31");
    cy.addAnnualReport(2, "1992-01-01", "1991-12-31");
    cy.addAnnualReport(3, "1993-01-01", "1992-12-31");
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Annual Reports Form",
      variant: "filled",
    });

    // SUMMMARY
    cy.findByText(/Submit Changes/i).click();
    cy.findByText(/review and submit information/i).click();
    cy.findByText(/project overview not added/i).should("be.visible");
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.findByText(/Annual Report 3/i).should("be.visible");
    cy.findByText(/Milestone Report 1/i).should("be.visible");
    cy.checkA11y("main", tempRules, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Summary Form",
      variant: "empty",
    });
  });

  it("properly displays validation errors", () => {
    // load more projects to trigger unique proposal reference error
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/006_commit_project_revision");
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");

    // OVERVIEW
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/0");

    cy.findByLabelText(/Proposal Reference/i).type("001");
    cy.injectAxe();
    // Check error message accessibility
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit Project Overview").click();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "with errors",
    });
    cy.get(".error-detail").should("have.length", 8);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");

    cy.findByText(/Project Details/i).click();

    // MILESTONE REPORTS
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Add another milestone report/i).click();

    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 2);
    cy.injectAxe();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Milestone Reports Form",
      variant: "with errors",
    });

    // QUARTERLY REPORTS
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/4");

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
    cy.injectAxe();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Quarterly Reports Form",
      variant: "with errors",
    });
    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", { name: /add another annual report/i }).click();
    cy.findByRole("status").first().should("have.text", "On track");
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 1);
  });

  it("undoes changes on a new project when the user clicks the Undo Changes button", () => {
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_commit_project_revision");
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
    cy.sqlFixture("dev/006_commit_project_revision");
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

  it("Allows to create and update a project", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    // add overview
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
    cy.findByRole("button", { name: /^submit/i }).click();

    // add managers
    cy.findByText(/Add project managers/i).click();
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.findByText(/Add project contacts/i).click();
    cy.fillContactsForm("Loblaw003", "Loblaw004");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports
    cy.findByText(/Milestone reports/i).click();
    cy.findByText(/Add milestone reports/i).click();
    cy.findByText(/Add another milestone report/i).click();

    cy.url().should("include", "/form/3");
    cy.get('[aria-label="Milestone Description"]').clear().type("desc");
    cy.addDueDate(0, "2020-01-01");
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /^submit/i }).click();

    //add quarterly reports
    cy.addQuarterlyReport(
      1,
      "2020-01-01",
      "2020-02-02",
      "I am the first general comment"
    );
    cy.addQuarterlyReport(
      2,
      "2022-01-01",
      "2022-02-02",
      "I am the second general comment"
    );

    cy.findByText(/^submit/i).click();
    cy.contains("Changes saved.");

    cy.addAnnualReport(
      1,
      "2022-01-01",
      "2022-02-02",
      "Annual report description n stuff"
    );
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Review and Submit Project");
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
    cy.findAllByText(/General Comments/i)
      .eq(0)
      .next()
      .should("have.text", "Some comments");
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
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "Loblaw004, Bob004");
    cy.get("body").happoScreenshot({
      component: "Project Summary Form",
      variant: "filled",
    });
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("View").click();
    cy.url().should("include", "/form/0");

    // Verify the forms render in view mode for committed project revisions
    cy.findByRole("heading", { name: "3. Submit changes" }).should("not.exist");
    cy.findByRole("link", { name: "Project overview" })
      .next()
      .should("not.exist");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Funding Stream RFP ID/i)
      .next()
      .should("have.text", "Emissions Performance - 2020");
    cy.findByText(/Project Details/i).click();
    cy.findByRole("link", { name: "Project managers" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project managers" }).click();
    cy.url().should("include", "/form/1");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText("Tech Team Primary (optional)")
      .next()
      .should("have.text", "Swanson, Ron");
    cy.findByRole("link", { name: "Project contacts" })
      .next()
      .should("not.exist");
    cy.findByRole("link", { name: "Project contacts" }).click();
    cy.url().should("include", "/form/2");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/primary contact/i, "Loblaw003, Bob003");

    cy.findByText(/Annual reports/i).click();
    cy.findByRole("link", { name: "Annual reports" }).click();
    cy.url().should("include", "/form/5");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.findByText(/Annual Report 1/);

    // Edit the project: change the name, delete a manager and contact, change a milestone report date, change an annual report comment, delete a quarterly report.
    // edit overview
    cy.findByText(/Project Overview/i).click();
    cy.findByRole("link", { name: "Project overview" }).click();
    cy.useMockedTime(new Date("June 10, 2020 09:00:01"));
    cy.findByText("Edit").click();

    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Foo")
      .clear()
      .type("Bar");

    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Overview Form",
      variant: "editing",
    });
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit managers
    cy.contains("Review and Submit Project");
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project managers/i).click();
    cy.url().should("include", "/form/1");

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
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit contacts
    cy.contains("Review and Submit Project");
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.get("label")
      .contains("Secondary Contacts")
      .parent()
      .find("button")
      .contains("Remove")
      .click();
    cy.wait(1000);

    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit milestone reports
    cy.contains("Review and Submit Project");
    cy.useMockedTime(new Date("June 10, 2020 09:00:01"));
    cy.findByRole("button", { name: /Milestone reports/i }).click();
    cy.findByText(/Edit milestone 1/i).click();
    cy.get('[aria-label*="Milestone Description"]')
      .eq(0)
      .clear()
      .type("new description");
    cy.get('[aria-label*="Due Date"]').eq(0).click();
    cy.get(".react-datepicker__month-select").select(0);
    cy.get(".react-datepicker__year-select").select("1999");
    cy.get(`.react-datepicker__day--001`)
      .not(`.react-datepicker__day--outside-month`)
      .click();
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Milestone Reports Form",
      variant: "editing",
    });
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Submit changes/i).click();
    cy.contains("Changes saved.");
    cy.findByText(/Review and submit information/i).click();

    // edit quarterly reports
    cy.contains("Review and Submit Project");
    cy.findByRole("button", { name: /Quarterly reports/i }).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.findByText(/Quarterly Report 1/i).click();
    cy.findAllByText(/Remove/i)
      .first()
      .click();
    cy.contains("Changes saved.");
    cy.findByText(/Quarterly Report 2/i).should("not.exist");
    cy.findByText(/No reports due/).should("be.visible");
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Quarterly Reports Form",
      variant: "editing",
    });
    cy.wait(1000);
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Submit changes/i).click();
    cy.contains("Changes saved.");
    cy.findByText(/Review and submit information/i).click();

    // edit annual reports
    cy.contains("Review and Submit Project");
    cy.findByText(/5. Annual reports/i).click();
    cy.findByText(/Edit annual reports/i).click();
    cy.findByText("Annual Report 1").click();
    cy.get('[aria-label*="General Comments"]')
      .eq(0)
      .clear()
      .type("new comment");
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Submit changes/i).click();
    cy.contains("Changes saved.");
    cy.findByText(/Review and submit information/i).click();

    // check diffs
    cy.contains("Review and Submit Project");

    cy.get("#root_projectName-diffOld").should("have.text", "Foo");
    cy.get("#root_projectName-diffNew").should("have.text", "Bar");

    cy.get("#root_cifUserId-diffOld").should("have.text", "Ludgate, April");
    cy.get("#root_cifUserId-diffOld")
      .next()
      .next()
      .should("have.text", "REMOVED");

    cy.get("#root_comments-diffOld").should(
      "have.text",
      "Annual report description n stuff"
    );
    cy.get("#root_comments-diffNew").should("have.text", "new comment");

    cy.findByRole("button", { name: /^submit/i }).should("be.disabled");
    cy.get("body").happoScreenshot({
      component: "Project Revision Summary",
      variant: "no_change_reason",
    });

    // Verify that the revision can be accessed by other users
    cy.mockLogin("cif_internal");
    cy.visit("/cif/projects");
    cy.findByRole("button", { name: /view/i }).click();
    cy.findByText(/resume edition/i).click();
    cy.findByLabelText("Project Name").eq(0).should("have.value", "Bar");
    cy.findByLabelText("Project Name").eq(0).clear().type("Baz");
    cy.findByRole("button", { name: /submit project overview/i }).click();
    cy.findByText(/review and submit project/i).should("exist");

    // Navigate back to the review and submit information page
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.findByRole("button", { name: /view/i }).click();
    cy.findByText(/resume edition/i).click();
    cy.findByText(/submit change/i).click();
    cy.findByText(/review and submit information/i).click();
    cy.findByText(/review and submit project/i).should("exist");
    cy.get("textarea").click().type("foo");

    cy.injectAxe();
    // Temporarily disable axe for dl accessibility checks
    const tempRules = {
      rules: {
        dlitem: { enabled: false },
        "definition-list": { enabled: false },
        "duplicate-id": { enabled: false },
      },
    };
    //Checking for diffing color accessibility
    cy.checkA11y("main", tempRules, logAxeResults);

    // Allow the component to finish saving before taking screenshot
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Revision Summary",
      variant: "with_change_reason",
    });
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.url().should("include", "/cif/projects");
    cy.findByRole("button", { name: /view/i }).click();
    cy.url().should("include", "/form/0");

    // Check the project was updated
    cy.findByText(/Project Name/i)
      .next()
      .should("have.text", "Baz");
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Project managers/i).click();
    cy.findByText(/tech team secondary/i).should("not.exist");
    cy.findByText(/Project contacts/i).click();
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "No Secondary contacts");
    cy.findByText(/Milestone reports/i).click();
    cy.get("a")
      .contains(/Milestone 1/i)
      .click();
    cy.findAllByText(/Report Due Date/i)
      .eq(0)
      .next()
      .contains(/Jan[.]? 1, 1999/i);
    cy.findByText(/Quarterly reports/i).click();
    cy.get("a")
      .contains(/Quarterly reports/i)
      .click();

    cy.findByText(/Annual reports/i).click();
    cy.get("a")
      .contains(/Annual reports/i)
      .click();
    cy.findByText(/new comment/i);
  });

  it("discards the revision when the user clicks the Discard Revision button", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    cy.findByText(/Submit Changes/i).click();
    cy.findByText(/Review and submit information/i).click();
    cy.contains("Review and Submit Project");
    cy.wait(1000);
    cy.findByRole("button", { name: /^discard/i }).click();
    cy.findByText("Proceed").click();

    cy.contains("CIF Projects");
    cy.contains("Add a Project");
  });
  it("creates new contact and redirect user back to project contact form and populate project contact form with newly created contact", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
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
    cy.get("input[aria-label='Given Name']").should("be.visible").type("Bob");
    cy.get("input[aria-label='Family Name']").type("Loblaw");
    cy.get("input[aria-label=Email]").type("bob@loblaw.ca");
    cy.get("input[aria-label=Phone]").type("1234567890");
    cy.get("input[aria-label='Company Name']").type("ABC");
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit").click();
    //Back to project contact form
    cy.url().should("include", "/form/2");
    cy.findByLabelText(/primary contact/i).should("have.value", "Loblaw, Bob");

    cy.findAllByRole("button", { name: /Create new contact/i }).should(
      "not.exist"
    );
  });
});
