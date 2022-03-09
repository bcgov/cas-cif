import logAxeResults from "../../plugins/logAxeResults";

describe("the operators page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_project");
    cy.mockLogin("cif_internal");
  });

  it("displays the list of operators", () => {
    cy.visit("/cif/operators");
    cy.get("h2").contains("Operators");
    cy.injectAxe();
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Operators Page",
    });
  });

  it("allows the list of operators to be paginated, filtered and ordered", () => {
    cy.visit("/cif/operators");
    cy.get("h2").contains("Operators");
    cy.get("tbody tr").should("have.length", 3);
    cy.get("[placeholder='Filter']").first().type("first operator legal name");
    cy.get("button").contains("Apply").click();
    cy.get("tbody tr").should("have.length", 1);
    cy.get("button").contains("Clear").click();
    cy.get("tbody tr").should("have.length", 3);
    // click twice for descending order
    cy.get("thead th").contains("Operator Legal Name").click();
    cy.get("thead th").contains("Operator Legal Name").click();
    cy.contains("third operator legal name");
  });

  it("allows an operator to be edited", () => {
    cy.visit("/cif/operators");
    cy.get("button").contains("View").click();
    cy.contains("Operator Information");
    cy.get("body").happoScreenshot({
      component: "Operator View Page",
    });
    cy.contains("first operator legal name");
    cy.contains("first operator trade name");
    cy.contains("ABCD");
    cy.get("button").contains("Edit").click();
    cy.contains("Edit Operator");
    cy.get("body").happoScreenshot({
      component: "Operator Edit Page",
    });
    cy.get("input[aria-label='Legal Name']").should(
      "have.value",
      "first operator legal name"
    );
    cy.get("input[aria-label='Trade Name']").should(
      "have.value",
      "first operator trade name"
    );
    cy.get("input[aria-label='BC Registry ID (optional)']").should(
      "have.value",
      "AB1234567"
    );
    cy.get("input[aria-label='Operator Code (optional)']").should(
      "have.value",
      "ABCD"
    );
    cy.get("input[aria-label='Trade Name']").clear().type("Updated");
    cy.get("button").contains("Submit").click();
    cy.get("table").contains("Updated");
  });
});
