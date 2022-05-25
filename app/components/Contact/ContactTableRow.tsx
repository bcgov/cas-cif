import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import { getContactViewPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ContactTableRow_contact$key } from "__generated__/ContactTableRow_contact.graphql";

interface Props {
  contact: ContactTableRow_contact$key;
}

const ContactTableRow: React.FC<Props> = ({ contact }) => {
  const { id, fullName, fullPhone, contactPosition } = useFragment(
    graphql`
      fragment ContactTableRow_contact on Contact {
        id
        fullName
        fullPhone
        contactPosition
      }
    `,
    contact
  );

  const router = useRouter();

  const handleViewContact = () => {
    router.push(getContactViewPageRoute(id));
  };

  return (
    <tr>
      <td>{fullName}</td>
      <td>{fullPhone}</td>
      <td>{contactPosition}</td>
      <td>
        <div className="actions">
          <Button size="small" onClick={handleViewContact}>
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
