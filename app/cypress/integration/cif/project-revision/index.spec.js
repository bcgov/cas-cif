import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
  });

  it("renders the project forms", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/form/0");
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
    cy.findByText(/Add project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.injectAxe();
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Managers Form",
      variant: "empty",
    });

    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();

    cy.get('[placeholder="Select a Contact"]').should("have.length", 4);
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Contacts Form",
      variant: "empty",
    });
    cy.findByText(/Submit contacts/i).click();

    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();

    cy.url().should("include", "/form/3");

    cy.addQuarterlyReport(1, "1991-01-01");
    cy.addQuarterlyReport(2, "1992-01-01");
    cy.addQuarterlyReport(3, "1993-01-01");

    cy.get('label[for*="reportDueDate"]').should("have.length", 3);
    cy.checkA11y("main", null, logAxeResults);
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Quarterly Reports Form",
      variant: "filled",
    });
    cy.findByRole("button", { name: /^submit/i }).click();
    // Annual reports
    cy.findByText(/Annual reports/i).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/4");
    cy.addAnnualReport(1, "1991-01-01");
    cy.addAnnualReport(2, "1992-01-01");
    cy.addAnnualReport(3, "1993-01-01");
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Annual Reports Form",
      variant: "filled",
    });
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.wait(1000);
    cy.findByText(/review and submit information/i).click();
    cy.findByText(/project overview not added/i).should("be.visible");
    cy.findByText(/project managers not added/i).should("be.visible");
    cy.checkA11y("main", tempRules, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Project Summary Form",
      variant: "empty",
    });
  });

  it("properly displays validation errors", () => {
    // load more projects to trigger unique proposal reference error
    cy.sqlFixture("dev/004_cif_project");
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
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
    cy.get(".error-detail").should("have.length", 7);
    // Renders the default error message for a required field
    cy.get(".error-detail").last().should("contain", "Please enter a value");

    cy.findByText(/Project Details/i).click();
    cy.findByText(/Add project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.findByRole("button", { name: /add/i }).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /Submit Contacts/i }).click();
    cy.get(".error-detail").should("have.length", 4);
    cy.injectAxe();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Contacts Form",
      variant: "with errors",
    });
    // Quarterly reports
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/3");

    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
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
    cy.url().should("include", "/form/4");
    cy.findByRole("button", { name: /add another annual report/i }).click();
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.get(".error-detail").should("have.length", 1);
    cy.injectAxe();
    cy.checkA11y(".error-detail", null, logAxeResults);
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Project Annual Reports Form",
      variant: "with errors",
    });
  });

  it("undoes changes on a new project when the user clicks the Undo Changes button", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");

    cy.get("button").contains("Add a Project").click();
    cy.fillOverviewForm(
      "Emissions Performance",
      "2020",
      "first operator legal name (AB1234567)",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project Underway"
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
      "Select a Project Status"
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
    cy.addQuarterlyReport(
      1,
      "2020-01-01",
      "2020-02-02",
      "I am the first general comment"
    );
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.findByText(/Quarterly Report 1/i).should("not.exist");
    cy.get('[label*="Due Date"]').should("have.length", 0);
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
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project Underway"
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
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Add annual report/i).click();
    cy.addAnnualReport(
      1,
      "2022-01-01",
      "2022-02-02",
      "Annual report description n stuff"
    );
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.wait(1000);
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

    // Edit the project: change the name, delete a manager and contact, and change a quarterly report date.
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

    // edit quarterly reports
    cy.contains("Review and Submit Project");
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.get('[label*="Due Date"]').eq(0).clear().type("1995-01-01");
    cy.contains("Changes saved.");
    cy.get("body").happoScreenshot({
      component: "Project Quarterly Reports Form",
      variant: "editing",
    });
    cy.findByRole("button", { name: /^submit/i }).click();

    // check diffs
    cy.contains("Review and Submit Project");

    cy.get("#root_projectName-diffOld").should("have.text", "Foo");
    cy.get("#root_projectName-diffNew").should("have.text", "Bar");

    cy.get("#root_cifUserId-diffOld").should("have.text", "Ludgate, April");
    cy.get("#root_cifUserId-diffOld")
      .next()
      .next()
      .should("have.text", "REMOVED");

    cy.findByRole("button", { name: /^submit/i }).should("be.disabled");
    cy.get("body").happoScreenshot({
      component: "Project Revision Summary",
      variant: "no_change_reason",
    });
    cy.get("textarea").click().type("foo");
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
      .should("have.text", "Bar");
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Project managers/i).click();
    cy.findByText(/tech team secondary/i).should("not.exist");
    cy.findByText(/Project contacts/i).click();
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "No Secondary contacts");
    cy.findByText(/Quarterly reports/i).click();
    cy.get("a")
      .contains(/Quarterly reports/i)
      .click();
    cy.get('[label*="Due Date"]').eq(0).should("have.value", "1995-01-01");
  });

  it.only("undoes changes on an existing project when the user clicks the Undo Changes button", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");

    // create and save the project
    cy.get("button").contains("Add a Project").click();
    cy.fillOverviewForm(
      "Emissions Performance",
      "2020",
      "first operator legal name (AB1234567)",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project Underway"
    );
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.findByText(/Add project managers/i).click();
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Add project contacts/i).click();
    cy.fillContactsForm("Loblaw003", "Loblaw004");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Add another quarterly report/i);
    cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "Just a test comment");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText(/Add another annual report/i);
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Review and Submit Project");
    cy.findByRole("button", { name: /^submit/i }).click();

    // undo overview
    cy.findByRole("button", { name: /^view/i }).click();
    cy.findByRole("button", { name: /edit/i }).click();
    cy.findByLabelText(/Funding Stream$/i).select("Innovation Accelerator");
    cy.findByLabelText(/Funding Stream RFP/i).select("2021");
    cy.findByLabelText(/Project Name/i)
      .clear()
      .type("New Foo");
    cy.findByLabelText(/Total Funding Request/i)
      .clear()
      .type("5");
    cy.checkOverviewForm(
      "Innovation Accelerator",
      "2021",
      "first operator legal name (AB1234567)",
      "TEST-123-12345",
      "New Foo",
      "Bar",
      "$5.00",
      "Project Underway"
    );

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkOverviewForm(
      "Emissions Performance",
      "2020",
      "first operator legal name (AB1234567)",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "$100.00",
      "Project Underway"
    );

    //undo managers
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project managers/i).click();
    cy.findByLabelText(/tech team primary/i).click();
    cy.contains("Ludgate").click();
    cy.checkManagersForm("Ludgate, April", "Ludgate, April", "Knope, Leslie");

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkManagersForm("Swanson, Ron", "Ludgate, April", "Knope, Leslie");

    //undo contacts
    cy.findByText(/Edit project contacts/i).click();
    cy.findByLabelText(/Primary contact/i).click();
    cy.contains("Loblaw001").click();
    cy.checkContactsForm("Loblaw001, Bob001", "Loblaw004, Bob004");

    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.checkContactsForm("Loblaw003, Bob003", "Loblaw004, Bob004");

    //undo quarterly reports
    cy.findByText(/Quarterly reports/i).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.get('[label*="Due Date"]').eq(0).should("have.value", "2020-01-01");
    cy.get('[label*="Due Date"]').eq(0).type("2020-01-10");
    cy.findByRole("button", { name: /undo changes/i }).click();
    cy.get('[label*="Due Date"]').eq(0).should("have.value", "2020-01-01");
  });
});
