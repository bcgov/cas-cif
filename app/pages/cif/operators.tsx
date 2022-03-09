import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { operatorsQuery } from "__generated__/operatorsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import Table from "components/Table";
import OperatorTableRow from "components/Operator/OperatorTableRow";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import { useCreateNewOperatorFormChange } from "mutations/Operator/createNewOperatorFormChange";
import { useRouter } from "next/router";
import { getOperatorFormPageRoute } from "pageRoutes";
import { createNewOperatorFormChangeMutation$data } from "__generated__/createNewOperatorFormChangeMutation.graphql";

export const OperatorsQuery = graphql`
  query operatorsQuery(
    $legalName: String
    $tradeName: String
    $bcRegistryId: String
    $operatorCode: String
    $offset: Int
    $pageSize: Int
    $orderBy: [OperatorsOrderBy!]
  ) {
    session {
      ...DefaultLayout_session
    }
    allOperators(
      first: $pageSize
      offset: $offset
      filter: {
        legalName: { includesInsensitive: $legalName }
        tradeName: { includesInsensitive: $tradeName }
        bcRegistryId: { includesInsensitive: $bcRegistryId }
        operatorCode: { includesInsensitive: $operatorCode }
      }
      orderBy: $orderBy
    ) {
      totalCount
      edges {
        node {
          id
          ...OperatorTableRow_operator
        }
      }
    }
    pendingNewOperatorFormChange: pendingNewFormChangeForTable(
      tableName: "operator"
    ) {
      id
    }
  }
`;

const tableFilters = [
  new TextFilter("Operator Legal Name", "legalName"),
  new TextFilter("Operator Trade Name", "tradeName"),
  new TextFilter("BC Registry Id", "bcRegistryId"),
  new TextFilter("Operator Code", "operatorCode"),
  new NoHeaderFilter(),
];

export function Operators({ preloadedQuery }: RelayProps<{}, operatorsQuery>) {
  const router = useRouter();

  const { allOperators, session, pendingNewOperatorFormChange } =
    usePreloadedQuery(OperatorsQuery, preloadedQuery);

  const [addOperator, isAddingOperator] = useCreateNewOperatorFormChange();

  const handleAddOperator = () => {
    addOperator({
      variables: {},
      onCompleted: (response: createNewOperatorFormChangeMutation$data) => {
        router.push(
          getOperatorFormPageRoute(response.createFormChange.formChange.id)
        );
      },
    });
  };

  const handleResumeAddOperator = () => {
    router.push(getOperatorFormPageRoute(pendingNewOperatorFormChange.id));
  };

  const createOrResumeButton = pendingNewOperatorFormChange ? (
    <Button onClick={handleResumeAddOperator}>Resume Operator Creation</Button>
  ) : (
    <Button onClick={handleAddOperator} disabled={isAddingOperator}>
      Add an Operator
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>CIF Operators</h2>
        <section>{createOrResumeButton}</section>
      </header>

      <Table
        paginated
        totalRowCount={allOperators.totalCount}
        filters={tableFilters}
      >
        {allOperators.edges.map(({ node }) => (
          <OperatorTableRow key={node.id} operator={node} />
        ))}
      </Table>

      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(Operators, OperatorsQuery, withRelayOptions);
