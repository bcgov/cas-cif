import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectOverwiewQuery } from "__generated__/ProjectOverwiewQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import { getAttachmentsPageRoute } from "pageRoutes";
import { useRouter } from "next/router";

const pageQuery = graphql`
  query ProjectOverwiewQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      id
      projectName
    }
  }
`;

function ProjectOverview({
  preloadedQuery,
}: RelayProps<{}, ProjectOverwiewQuery>) {
  const { session, project } = usePreloadedQuery(pageQuery, preloadedQuery);

  const router = useRouter();

  const goToProjectAttachmentsView = async () => {
    await router.push(getAttachmentsPageRoute(project.id));
  };

  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
      <Button role="button" onClick={goToProjectAttachmentsView}>
        View Project Attachments
      </Button>
    </DefaultLayout>
  );
}

export default withRelay(ProjectOverview, pageQuery, withRelayOptions);
