import { getAttachmentDeleteRoute } from "routes/pageRoutes";

const hardDeleteAttachment = (attachmentId, formChangeRowId, connectionId) => {
  fetch(getAttachmentDeleteRoute(attachmentId).pathname, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variables: {
        input: {
          formChangeId: formChangeRowId,
        },
        connections: [connectionId],
      },
    }),
  });
};

export default hardDeleteAttachment;
