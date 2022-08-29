import { Button } from "@button-inc/bcgov-theme";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCreateNewContactFormChange } from "mutations/Contact/createNewContactFormChange";
import { useRouter } from "next/router";
import { getContactFormPageRoute } from "routes/pageRoutes";
import { createNewContactFormChangeMutation$data } from "__generated__/createNewContactFormChangeMutation.graphql";

interface Props {
  projectRevisionRowId: number;
  connectionString: string;
  projectContactFormId: string;
  projectContactFormRowId: number;
  projectId: number;
  contactIndex: number;
}

const NewContactButton: React.FC<Props> = ({
  projectRevisionRowId,
  connectionString,
  projectContactFormId,
  projectContactFormRowId,
  projectId,
  contactIndex,
}) => {
  const router = useRouter();
  const [addContact, isAddingContact] = useCreateNewContactFormChange();

  const clickHandler = (e: React.ChangeEvent<{}>) => {
    e.preventDefault();

    // Function to create a new contact form change and redirect to it
    addContact({
      variables: {},
      onCompleted: (response: createNewContactFormChangeMutation$data) => {
        router.push(
          getContactFormPageRoute(
            response.createFormChange.formChange.id,
            projectContactFormId,
            projectId,
            contactIndex,
            projectRevisionRowId,
            connectionString,
            projectContactFormRowId
          )
        );
      },
    });
  };

  return (
    <Button
      onClick={clickHandler}
      style={{ margin: 0 }}
      size="medium"
      variant="secondary"
      disabled={isAddingContact}
    >
      <FontAwesomeIcon icon={faUserPlus} /> Create new contact
    </Button>
  );
};

export default NewContactButton;
