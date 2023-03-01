describe("The 500 page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
  });

  it("navigates to the correct page when the refresh link is clicked", () => {
    cy.visit("/");
    cy.visit("/500", { failOnStatusCode: false });
    cy.get("body").happoScreenshot({
      component: "500 page server-side",
    });
    cy.get("a[href='javascript:;']").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("h1", "Welcome").should("be.visible");
    cy.contains("h3", "CleanBC Industry Fund").should("be.visible");
    cy.findByRole("button", { name: /Administrator Login/i }).should("exist");
    cy.findByRole("button", { name: /External User Login/i }).should("exist");
    cy.findByRole("button", { name: /External User Login/i }).should(
      "have.attr",
      "href",
      "/cif-external"
    );
  });
});
