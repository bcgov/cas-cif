/**
 * This file contains the common components used in the different form summary pages.
 * FormRemoved: is used to show a message when a form has been removed and it shows different styles depending on the page.
 * FormNotAddedOrUpdated: is used to show a message when a form has not been added or updated depending on wether it is the first revision or not.
 */

interface FormRemovedProps {
  isOnAmendmentsAndOtherRevisionsPage: boolean;
  formTitle: string;
}

export const FormRemoved: React.FC<FormRemovedProps> = ({
  isOnAmendmentsAndOtherRevisionsPage,
  formTitle,
}) => (
  <em
    className={
      isOnAmendmentsAndOtherRevisionsPage
        ? "diffAmendmentsAndOtherRevisionsOld"
        : "diffReviewAndSubmitInformationOld"
    }
  >
    {formTitle} removed
  </em>
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
