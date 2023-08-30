import { getAttachmentDeleteRoute } from "routes/pageRoutes";

const hardDeleteAttachment = async (
  attachmentId,
  formChangeRowId,
  csrfToken
) => {
  const brianna = await fetch("/");

  console.log("brianna", brianna);
  fetch(getAttachmentDeleteRoute(attachmentId).pathname, {
    method: "DELETE",
    // headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    headers: { "Content-Type": "application/json" },
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
