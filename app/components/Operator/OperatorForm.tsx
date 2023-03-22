import FormBase from "components/Form/FormBase";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { JSONSchema7 } from "json-schema";
import { OperatorFormQuery } from "__generated__/OperatorFormQuery.graphql";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { withRelay, RelayProps } from "relay-nextjs";

export const Query = graphql`
  query OperatorFormQuery {
    contactFormBySlug: formBySlug(slug: "operator") {
      jsonSchema
    }
  }
`;

export function OperatorForm({
  preloadedQuery,
}: RelayProps<{}, OperatorFormQuery>) {
  const contactFormBySlug = usePreloadedQuery(Query, preloadedQuery);
  console.log(contactFormBySlug);
  console.log("----");
  return null;
  return (
    <FormBase
      schema={operatorFormBySlug.jsonSchema as JSONSchema7}
      uiSchema={{}}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary">
        Discard Changes
      </Button>
    </FormBase>
  );
}

export default withRelay(OperatorForm, Query, withRelayOptions);
