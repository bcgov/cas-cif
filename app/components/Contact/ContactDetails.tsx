import { graphql, useFragment } from "react-relay";
import { ContactDetails_contact$key } from "__generated__/ContactDetails_contact.graphql";

interface Props {
  contact: ContactDetails_contact$key;
  className?: string;
}

const ContactDetails: React.FC<Props> = ({ contact, className }) => {
  const contactDetails = useFragment(
    graphql`
      fragment ContactDetails_contact on Contact {
        email
        companyName
        contactPosition
      }
    `,
    contact
  );

  if (!contact) {
    return null;
  }

  const { email, companyName, contactPosition } = contactDetails;

  return (
    <div className={className}>
      <p>
        <span>Email</span> {email}
      </p>
      {companyName && (
        <p>
          <span>Company</span> {companyName}
        </p>
      )}
      {contactPosition && (
        <p>
          <span>Position</span> {contactPosition}
        </p>
      )}
      <style jsx>{`
        div p {
          margin-bottom: 0;
        }
        div span {
          font-weight: bold;
        }
        div {
          margin-bottom: 1.25em;
        }
      `}</style>
    </div>
  );
};

export default ContactDetails;
