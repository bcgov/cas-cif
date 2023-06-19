/**
 * This file contains the common components used in the different form summary pages.
 * FormRemoved: is used to show a message when a form has been removed and it shows different styles depending on the page.
 * FormNotAddedOrUpdated: is used to show a message when a form has not been added or updated depending on wether it is the first revision or not.
 */

interface FormRemovedProps {
  isOnAmendmentsAndOtherRevisionsPage: boolean;
  formTitle: string;
}

export const FormRemoved: React.FC<FormRemovedProps> = ({ formTitle }) => (
  <dd>
    <em className={"diffOld"}>{formTitle}</em>
    <style jsx>{`
      :global(.diffReviewAndSubmitInformationOld) {
        background-color: #fad980;
      }
      :global(.diffReviewAndSubmitInformationNew) {
        background-color: #94bfa2;
      }
      :global(.diffAmendmentsAndOtherRevisionsOld) {
        color: #cd2026;
        text-decoration: line-through;
        font-size: 0.7em;
      }
      :global(.diffAmendmentsAndOtherRevisionsNew) {
        font-size: 0.7em;
      }
    `}</style>
  </dd>
);

interface FormNotAddedOrUpdatedProps {
  isFirstRevision: boolean;
  formTitle: string;
}

export const FormNotAddedOrUpdated: React.FC<FormNotAddedOrUpdatedProps> = ({
  isFirstRevision,
  formTitle,
}) => (
  <dd>
    <em>
      {formTitle} not {isFirstRevision ? "added" : "updated"}
    </em>
  </dd>
);
