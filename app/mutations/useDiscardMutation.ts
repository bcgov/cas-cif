import { useMutation, UseMutationConfig } from "react-relay";
import {
  Disposable,
  GraphQLTaggedNode,
  MutationParameters,
} from "relay-runtime";

/**
 *
 * This hook creates a discard mutation by wrapping the relay `useMutation` hook and
 * setting the mutation variables with a `deletedAt` value.
 *
 * @param relayNodeName the name of the relay node the mutation is applied to, e.g. "projectRevision", "formChange", ...
 * @param mutation the GraphQL 'update' mutation on the relay node
 * @returns a tuple with the discard mutation and a boolean indicating if the mutation is in flight
 *
 * example usage:
 *
 * const mutation = graphql`
 *    mutation discardMyEntityMutation($input: UpdateMyEntityInput!) {
 *     updateMyEntity(input: $input) {
 *      __typename
 *    }
 * }`;
 *
 * const [discardMyEntityMutation, isInFlight] = useDiscardMutation("myEntity", mutation);
 *
 */

export default function useDiscardMutation<
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
  const [updateMutation, isInFlight] = useMutation(mutation);

  const discardMutation = (
    formChangeId: string,
    config: Partial<UseMutationConfig<TMutation>>
  ) => {
    return updateMutation({
      variables: {
        input: {
          id: formChangeId,
          [`${relayNodeName}Patch`]: {
            deletedAt: new Date().toISOString(),
          },
        },
      },
      ...config,
    });
  };

  return [discardMutation, isInFlight];
}
