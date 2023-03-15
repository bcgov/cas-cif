import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { unauthorizedIdirQuery } from "__generated__/unauthorizedIdirQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import getConfig from "next/config";
import Button from "@button-inc/bcgov-theme/Button";
import Link from "next/link";
import BCGovLink from "@button-inc/bcgov-theme/Link";

const UnauthorizedIdirQuery = graphql`
  query unauthorizedIdirQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function UnauthorizedIdir({
  preloadedQuery,
}: RelayProps<{}, unauthorizedIdirQuery>) {
  const { query } = usePreloadedQuery(UnauthorizedIdirQuery, preloadedQuery);
  const supportEmail = getConfig()?.publicRuntimeConfig?.SUPPORT_EMAIL;
  return (
    <DefaultLayout session={query.session} title="Access required">
      <div id="unauthorized-idir-wrapper">
        <h3>Welcome to the CIF application</h3>
        <p id="unauthorized-idir-content">
          Hi there! Your IDIR needs to be granted access to use the application.
          You can contact the administrator at{" "}
          <Link href={`mailto:${supportEmail}`} passHref legacyBehavior>
            <BCGovLink>{supportEmail}</BCGovLink>
          </Link>{" "}
          or reach out via the <b>CIF Internal Users</b> channel on Microsoft
          Teams to request access.
        </p>
        <Link href={`mailto:${supportEmail}`} passHref>
          <Button>Email us</Button>
        </Link>
      </div>
      <style jsx>{`
        #unauthorized-idir-wrapper {
          width: 50vw;
        }
        #unauthorized-idir-content {
          margin: 2em 0;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(
  UnauthorizedIdir,
  UnauthorizedIdirQuery,
  withRelayOptions
);
