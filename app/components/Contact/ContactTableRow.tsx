import Button from "@button-inc/bcgov-theme/Button";
import useCreateEditContactFormChange from "mutations/Contact/createEditContactFormChange";
import { useRouter } from "next/router";
import { getContactFormPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ContactTableRow_contact$key } from "__generated__/ContactTableRow_contact.graphql";
import { createEditContactFormChangeMutation$data } from "__generated__/createEditContactFormChangeMutation.graphql";

interface Props {
  contact: ContactTableRow_contact$key;
}

const ContactTableRow: React.FC<Props> = ({ contact }) => {
  const { rowId, fullName, fullPhone, position } = useFragment(
    graphql`
      fragment ContactTableRow_contact on Contact {
        rowId
        fullName
        fullPhone
        position
      }
    `,
    contact
  );

  const router = useRouter();
  const [startContactRevision, isStartingContactRevision] =
    useCreateEditContactFormChange();

  const handleEditContact = () => {
    startContactRevision({
      variables: { contactRowId: rowId },
      onCompleted: (response: createEditContactFormChangeMutation$data) => {
        router.push(
          getContactFormPageRoute(response.createFormChange.formChange.id)
        );
      },
    });
  };

  return (
    <tr>
      <td>{fullName}</td>
      <td>{fullPhone}</td>
      <td>{position}</td>
      <td>
        <div className="actions">
          <Button
            size="small"
            disabled={isStartingContactRevision}
            onClick={handleEditContact}
          >
            Edit
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
