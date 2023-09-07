import { getAttachmentDeleteRoute } from "routes/pageRoutes";

const hardDeleteAttachment = async (attachmentId, formChangeRowId) => {
  const csrfToken = document.cookie.replace("qwerty=", "");
  fetch(getAttachmentDeleteRoute(attachmentId).pathname, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": decodeURIComponent(csrfToken),
    },
    body: JSON.stringify({
      variables: {
        input: {
          formChangeId: formChangeRowId,
        },
      },
    }),
  });
};

export default hardDeleteAttachment;
