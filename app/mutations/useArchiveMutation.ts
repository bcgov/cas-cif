import { UseMutationConfig } from "react-relay";
import {
  Disposable,
  GraphQLTaggedNode,
  MutationParameters,
} from "relay-runtime";
import useMutationWithErrorMessage from "./useMutationWithErrorMessage";

/**
 *
 * This hook creates an archive mutation by wrapping the custom `useMutationWithError` hook and
 * setting the mutation variables with a `archivedAt` value.
 *
 * @param relayNodeName the name of the relay node the mutation is applied to, e.g. "projectRevision", "formChange", ...
 * @param mutation the GraphQL 'update' mutation on the relay node
 * @returns a tuple with the archinf mutation and a boolean indicating if the mutation is in flight
 *
 * example usage:
 *
 * const mutation = graphql`
 *    mutation archiveMyEntityMutation($input: UpdateMyEntityInput!) {
 *     updateMyEntity(input: $input) {
 *      __typename
 *    }
 * }`;
 *
 * const [archiveMyEntityMutation, isInFlight] = useArchiveMutation("myEntity", mutation);
 *
 */

export default function useArchiveMutation<
  TMutation extends MutationParameters
>(
  relayNodeName: string,
  mutation: GraphQLTaggedNode
): [
  (
    relayId: string,
    config: Partial<UseMutationConfig<TMutation>>
  ) => Disposable,
  boolean
] {
  const [updateMutation, isInFlight] = useMutationWithErrorMessage(
    mutation,
    () => "An error occurred"
  );

  const archiveMutation = (
    id: string,
    config: Partial<UseMutationConfig<TMutation>>
  ) => {
    return updateMutation({
      variables: {
        input: {
          id,
          [`${relayNodeName}Patch`]: {
            archivedAt: new Date().toISOString(),
          },
        },
      },
      ...config,
    });
  };

  return [archiveMutation, isInFlight];
}
