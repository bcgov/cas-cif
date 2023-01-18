/**
 * This file contains the common components used in the different form summary pages.
 * FormRemoved: is used to show a message when a form has been removed and it shows different styles depending on the page.
 * FormNotAddedOrUpdated: is used to show a message when a form has not been added or updated depending on wether it is the first revision or not.
 */

interface FormRemovedProps {
  isOnAmendmentsAndOtherRevisionsPage: boolean;
  text: string;
}

export const FormRemoved: React.FC<FormRemovedProps> = ({
  isOnAmendmentsAndOtherRevisionsPage,
  text,
}) => (
  <em
    className={
      isOnAmendmentsAndOtherRevisionsPage
        ? "diffAmendmentsAndOtherRevisionsOld"
        : "diffReviewAndSubmitInformationOld"
    }
  >
    {text} removed
  </em>
);

interface FormNotAddedOrUpdatedProps {
  isFirstRevision: boolean;
  text: string;
}

export const FormNotAddedOrUpdated: React.FC<FormNotAddedOrUpdatedProps> = ({
  isFirstRevision,
  text,
}) => (
  <dd>
    <em>
      {text} not {isFirstRevision ? "added" : "updated"}
    </em>
  </dd>
);
