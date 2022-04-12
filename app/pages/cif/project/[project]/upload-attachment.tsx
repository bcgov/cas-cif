import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { uploadAttachmentQuery } from "__generated__/uploadAttachmentQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateAttachment } from "mutations/attachment/createAttachment";
import { FilePicker } from "@button-inc/bcgov-theme";
import bytesToSize from "lib/helpers/bytesToText";
import { getAttachmentsPageRoute } from "pageRoutes";
import { useRouter } from "next/router";

const pageQuery = graphql`
  query uploadAttachmentQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      id
      rowId
      projectName
    }
  }
`;

export function UploadAttachment({
  preloadedQuery,
}: RelayProps<{}, uploadAttachmentQuery>) {
  const { session, project } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

  const [createAttachment, isCreatingAttachment] = useCreateAttachment();

  const goToProjectAttachmentsView = async () => {
    await router.push(getAttachmentsPageRoute(project.id));
  };

  const saveAttachment = async (e) => {
    var file = e.target.files[0];
    const variables = {
      input: {
        attachment: {
          file: file,
          fileName: file.name,
          fileSize: bytesToSize(file.size),
          fileType: file.type,
          projectId: project.rowId,
        },
      },
    };
    console.log(variables);
    createAttachment({
      variables,
      onError: (err) => console.error(err),
      onCompleted: goToProjectAttachmentsView,
    });
  };

  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
      {isCreatingAttachment ? (
        <>
          <span>Uploading file...</span>
        </>
      ) : (
        <FilePicker onChange={saveAttachment} name={"upload-attachment"}>
          Upload Attachment
        </FilePicker>
      )}
    </DefaultLayout>
  );
}

export default withRelay(UploadAttachment, pageQuery, withRelayOptions);
