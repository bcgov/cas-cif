import { getAttachmentDeleteRoute } from "routes/pageRoutes";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    return match[2];
  } else {
    console.log(`No cookie matching ${name} was found`);
  }
};

const hardDeleteAttachment = async (attachmentId, formChangeRowId) => {
  const csrfToken = getCookie("luscaCSRF");
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
