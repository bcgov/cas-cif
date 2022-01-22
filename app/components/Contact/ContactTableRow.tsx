import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import { getContactViewPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ContactTableRow_contact$key } from "__generated__/ContactTableRow_contact.graphql";

interface Props {
  contact: ContactTableRow_contact$key;
}

const ContactTableRow: React.FC<Props> = ({ contact }) => {
  const { id, fullName, fullPhone, position } = useFragment(
    graphql`
      fragment ContactTableRow_contact on Contact {
        id
        fullName
        fullPhone
        position
      }
    `,
    contact
  );

  const router = useRouter();

  const handleViewClick = () => {
    router.push(getContactViewPageRoute(id));
  };

  return (
    <tr>
      <td>{fullName}</td>
      <td>{fullPhone}</td>
      <td>{position}</td>
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

        .actions {
          display: flex;
          justify-content: space-around;
        }
      `}</style>
    </tr>
  );
};

export default ContactTableRow;
