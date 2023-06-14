import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { pagesQuery } from "__generated__/pagesQuery.graphql";
import defaultRelayOptions from "lib/relay/withRelayOptions";
import { getUserGroupLandingRoute } from "lib/userGroups";
import Link from "next/link";
import BCGovLink from "@button-inc/bcgov-theme/Link";
import LoginForm from "components/Session/LoginForm";
import footerLinks from "data/externalLinks/footerLinks";
import useShowGrowthbookFeature from "lib/growthbookWrapper";

export const IndexQuery = graphql`
  query pagesQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function Index({ preloadedQuery }: RelayProps<{}, pagesQuery>) {
  const { query } = usePreloadedQuery(IndexQuery, preloadedQuery);

  // Growthbook - external-operators
  const showExternalOperatorsLogin =
    useShowGrowthbookFeature("external-operators");

  return (
    <DefaultLayout session={query.session}>
      <div id="welcoming-container">
        <div id="message">
          <h1>Welcome</h1>
          <h3>CleanBC Industry Fund</h3>
          <p>
            Refer to
            <Link
              passHref
              href={
                footerLinks.find(({ name }) => name === "Program Details").href
              }
              legacyBehavior
            >
              <BCGovLink target="_blank"> program details </BCGovLink>
            </Link>
            for the application materials and full information about the CleanBC
            Industry Fund (CIF).
          </p>
        </div>
        <div id="login-buttons">
          <LoginForm />
          {showExternalOperatorsLogin && <LoginForm isExternal={true} />}
        </div>
      </div>
      <style jsx>
        {`
          #welcoming-container {
            display: flex;
            margin: 20em auto;
            gap: 10em;
          }
          #login-buttons {
            display: flex;
            justify-content: center;
            flex-direction: column;
            gap: 1em;
          }
        `}
      </style>
    </DefaultLayout>
  );
}

export const withRelayOptions = {
  ...defaultRelayOptions,
  serverSideProps: async (ctx) => {
    const props = await defaultRelayOptions.serverSideProps(ctx);
    if ("redirect" in props) return props;
    const { getUserGroups } = await import(
      "server/helpers/userGroupAuthentication"
    );

    const groups = getUserGroups(ctx.req);
    if (groups.length === 0) return {};
    return {
      redirect: {
        destination: getUserGroupLandingRoute(groups),
      },
    };
  },
};

export default withRelay(Index, IndexQuery, withRelayOptions);
