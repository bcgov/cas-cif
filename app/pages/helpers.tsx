import { Button } from "@button-inc/bcgov-theme";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import { TaskListMode } from "components/TaskList/types";
import { useFormPages } from "data/formPages/formStructure";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import useRedirectToValidFormIndex from "hooks/useRedirectToValidFormIndex";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import { useRouter } from "next/router";
import {
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
} from "routes/pageRoutes";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";
import { useExternalFormPages } from "data/formPages/externalFormStructure";

export const useFormIndexHelpers = (
  projectId,
  projectRevisionId,
  pendingProjectRevisionId,
  latestCommitedProjectRevisionId,
  fundingStreamName,
  mode,
  formIndex,
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
    if (mode === "update" || formIndex === formPages.length - 1) {
      router.push(getProjectRevisionPageRoute(projectRevisionId));
    } else {
      router.push(
        getProjectRevisionFormPageRoute(projectRevisionId, formIndex + 1)
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
