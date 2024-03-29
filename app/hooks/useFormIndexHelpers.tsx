import { useExternalFormPages } from "data/formPages/externalFormStructure";
import { useFormPages } from "data/formPages/formStructure";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import useRedirectToValidFormIndex from "hooks/useRedirectToValidFormIndex";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import { useRouter } from "next/router";
import {
  getExternalProjectRevisionViewPageRoute,
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
  getProjectRevisionEditPageRoute,
} from "routes/pageRoutes";

export const useFormIndexHelpers = (
  projectId: number,
  projectRevisionId: string,
  pendingProjectRevisionId: string,
  latestCommitedProjectRevisionId: string,
  fundingStreamName: string,
  mode: string,
  formIndex: number,
  isInternal: boolean
) => {
  const router = useRouter();
  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProjectRevision.projectRevision.id,
            router.query.formIndex as string
          )
        );
      },
    });
  };
  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionFormPageRoute(
        pendingProjectRevisionId,
        router.query.formIndex as string
      )
    );
  };

  const isRedirectingNoFundingStream =
    useRedirectTo404IfFalsy(fundingStreamName);

  const fundingStream = isRedirectingNoFundingStream
    ? "err"
    : fundingStreamName;

  const internalFormPages = useFormPages(fundingStream);
  const externalFormPages = useExternalFormPages(fundingStream);
  const formPages = isInternal ? internalFormPages : externalFormPages;

  const handleSubmit = () => {
    if (mode === "create" && formIndex === formPages.length - 1) {
      router.push(getProjectRevisionPageRoute(projectRevisionId, isInternal));
    }
    // if project revision, route to preview revision
    else if (mode === "update") {
      if (isInternal) {
        router.push(getProjectRevisionEditPageRoute(projectRevisionId));
      }
      if (!isInternal) {
        router.push(getExternalProjectRevisionViewPageRoute(projectRevisionId));
      }
    } else {
      router.push(
        getProjectRevisionFormPageRoute(
          projectRevisionId,
          formIndex + 1,
          undefined,
          isInternal
        )
      );
    }
  };

  const isRedirecting = useRedirectTo404IfFalsy(projectRevisionId);
  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    projectRevisionId,
    latestCommitedProjectRevisionId,
    mode === "view"
  );

  const isRedirectingToValidFormIndex = useRedirectToValidFormIndex(
    formIndex,
    formPages.length
  );

  return {
    handleCreateRevision,
    isCreatingProjectRevision,
    handleResumeRevision,
    handleSubmit,
    isRedirecting,
    isRedirectingToLatestRevision,
    isRedirectingNoFundingStream,
    fundingStream,
    formPages,
    isRedirectingToValidFormIndex,
  };
};
