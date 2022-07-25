import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import { getOperatorViewPageRoute } from "routes/pageRoutes";
import { useFragment, graphql } from "react-relay";
import { OperatorTableRow_operator$key } from "__generated__/OperatorTableRow_operator.graphql";

interface Props {
  operator: OperatorTableRow_operator$key;
}

const OperatorTableRow: React.FC<Props> = ({ operator }) => {
  const { id, legalName, tradeName, bcRegistryId, operatorCode } = useFragment(
    graphql`
      fragment OperatorTableRow_operator on Operator {
        id
        legalName
        tradeName
        bcRegistryId
        operatorCode
      }
    `,
    operator
  );

  const router = useRouter();

  const handleViewClick = () => {
    router.push(getOperatorViewPageRoute(id));
  };

  return (
    <tr>
      <td className="op-legal-name">{legalName}</td>
      <td className="op-trade-name">{tradeName}</td>
      <td className="op-bc-registry-id">{bcRegistryId}</td>
      <td className="op-code">{operatorCode}</td>
      <td>
        <div className="actions">
          <Button size="small" onClick={handleViewClick}>
            View
          </Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
        .op-legal-name,
        .op-trade-name {
          max-width: 15rem;
        }
        .op-bc-registry-id {
          font-family: monospace;
          font-weight: bold;
          white-space: nowrap;
        }

        .op-code {
          text-align: center;
        }

        .actions {
          display: flex;
          justify-content: space-around;
        }
      `}</style>
    </tr>
  );
};

export default OperatorTableRow;
