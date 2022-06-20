import { Button } from "@button-inc/bcgov-theme";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCreateNewContactFormChange } from "mutations/Contact/createNewContactFormChange";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";
import { useRouter } from "next/router";
import { getContactFormPageRoute } from "pageRoutes";
import { createNewContactFormChangeMutation$data } from "__generated__/createNewContactFormChangeMutation.graphql";

interface Props {
  projectRevisionRowId: number;
  connectionString: string;
  projectContactFormId: string;
  projectId: number;
  contactIndex: number;
}

const NewContactButton: React.FC<Props> = ({
  projectRevisionRowId,
  connectionString,
  projectContactFormId,
  projectId,
  contactIndex,
}) => {
  const router = useRouter();
  const [addContact, isAddingContact] = useCreateNewContactFormChange();
  const [addContactMutation] = useAddContactToRevision();

  const clickHandler = (e: React.ChangeEvent<{}>) => {
    e.preventDefault();

    // Function to create a new contact form change and redirect to it
    const addContactFn = (formId) =>
      addContact({
        variables: {},
        onCompleted: (response: createNewContactFormChangeMutation$data) => {
          router.push(
            getContactFormPageRoute(
              response.createFormChange.formChange.id,
              formId,
              projectId,
              contactIndex
            )
          );
        },
      });

    if (projectContactFormId) {
      addContactFn(projectContactFormId);
    } else {
      // If we don't have the projectContactFormId(means we don't have the primary contact form either) we need to create one
      addContactMutation({
        variables: {
          input: {
            revisionId: projectRevisionRowId,
            contactIndex: contactIndex as number,
          },
          connections: [connectionString],
        },
        onCompleted: (res) =>
          // Creating a new contact form and redirecting to it
          addContactFn(res.addContactToRevision.formChangeEdge.node.id),
      });
    }
  };

  return (
    <Button
      onClick={clickHandler}
      style={{ margin: 0 }}
      size="medium"
      variant="primary"
      disabled={isAddingContact}
    >
      <FontAwesomeIcon icon={faUserPlus} /> Create new contact
    </Button>
  );
};

export default NewContactButton;
