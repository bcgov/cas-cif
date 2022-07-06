## Cypress testing helpers

At the beginning of the test file import : `import { aliasMutation } from "../../../utils/graphql-test-utils";`

In `beforeEach`, alias the mutations you want to test, for example:

```typescript
cy.intercept("POST", "http://localhost:3004/graphql", (req) => {
aliasQuery(req,updateContactFormChangeMutation");
aliasQuery(req, updateProjectContactFormChangeMutation");

...

});
```

Make Cypress wait until the mutation is completed before carrying on with the test, for example:

```typescript
// `@gql` prefix is added by the helper functions
cy.wait("@gqlupdateProjectContactFormChangeMutation")
  .its("response.body.data.updateFormChange.formChange.newFormData.contactId")
  .should("eq", 51);
```

For more details see: https://docs.cypress.io/guides/end-to-end-testing/working-with-graphql
