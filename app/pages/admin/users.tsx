import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { usersQuery } from "__generated__/usersQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const UsersQuery = graphql`
  query usersQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      allCifUsers {
        edges {
          node {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`;

function Users({ preloadedQuery }: RelayProps<{}, usersQuery>) {
  const { query } = usePreloadedQuery(UsersQuery, preloadedQuery);
  console.log("rendering", query);
  return (
    <DefaultLayout session={query.session}>
      <ul>
        {query.allCifUsers.edges.map(({ node }) => (
          <li key={node.id}>
            {node.firstName} {node.lastName}
          </li>
        ))}
      </ul>
    </DefaultLayout>
  );
}

export default withRelay(Users, UsersQuery, withRelayOptions);
