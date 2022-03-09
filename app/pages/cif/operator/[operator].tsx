import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import withRelayOptions from "lib/relay/withRelayOptions";
import { OperatorViewQuery } from "__generated__/OperatorViewQuery.graphql";
import { useRouter } from "next/router";
import { createEditOperatorFormChangeMutation$data } from "__generated__/createEditOperatorFormChangeMutation.graphql";
import useCreateEditOperatorFormChange from "mutations/Operator/createEditOperatorFormChange";
import { getOperatorFormPageRoute } from "pageRoutes";
import { Button } from "@button-inc/bcgov-theme";

const pageQuery = graphql`
  query OperatorViewQuery($operator: ID!) {
    session {
      ...DefaultLayout_session
    }
    operator(id: $operator) {
      id
      rowId
      legalName
      tradeName
      swrsLegalName
      swrsTradeName
      operatorCode
      swrsOrganisationId
      pendingFormChange {
        id
      }
    }
  }
`;

export function OperatorViewPage({
  preloadedQuery,
}: RelayProps<{}, OperatorViewQuery>) {
  const { session, operator } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const [startOperatorRevision, isStartingOperatorRevision] =
    useCreateEditOperatorFormChange();

  const handleEditOperator = () => {
    startOperatorRevision({
      variables: { operatorRowId: operator.rowId },
      onCompleted: (response: createEditOperatorFormChangeMutation$data) => {
        router.push(
          getOperatorFormPageRoute(response.createFormChange.formChange.id)
        );
      },
    });
  };

  const editButton = operator.pendingFormChange ? (
    <Button
      size="small"
      onClick={() =>
        router.push(getOperatorFormPageRoute(operator.pendingFormChange.id))
      }
    >
      Resume Editing
    </Button>
  ) : (
    <Button
      size="small"
      disabled={isStartingOperatorRevision}
      onClick={handleEditOperator}
    >
      Edit
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>Operator Information</h2>
        {editButton}
      </header>
      <dl>
        <dt>Legal Name</dt>
        <dd>{operator.legalName}</dd>

        <dt>Trade Name</dt>
        <dd>{operator.tradeName}</dd>

        <dt>CIF Operator Code</dt>
        <dd>{operator.operatorCode}</dd>

        <dt>Imported from SWRS</dt>
        <dd>{operator.swrsOrganisationId ? "Yes" : "No"}</dd>

        {operator.swrsOrganisationId && (
          <>
            <dt>Legal Name (SWRS)</dt>
            <dd>{operator.swrsLegalName}</dd>

            <dt>Trade Name (SWRS)</dt>
            <dd>{operator.swrsTradeName}</dd>
          </>
        )}
      </dl>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        header h2 {
          padding-right: 10px;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(OperatorViewPage, pageQuery, withRelayOptions);
