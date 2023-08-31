import { getAttachmentDeleteRoute } from "routes/pageRoutes";

const hardDeleteAttachment = async (attachmentId, formChangeRowId) => {
  // const brianna = await fetch("/");
  console.log("document", document.cookie);
  const csrfToken = document.cookie.replace("qwerty=", "");
  console.log("csrfToken", csrfToken);
  console.log("document.cookiedecoded", decodeURI(document.cookie));
  fetch(getAttachmentDeleteRoute(attachmentId).pathname, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    // headers: { "Content-Type": "application/json" },
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
