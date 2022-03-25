import { CacheConfigWithDebounce } from "lib/relay/debounceMutationMiddleware";
import { UseMutationConfig } from "react-relay";
import { commitMutation as baseCommitMutation } from "relay-runtime";
import {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationConfig,
  MutationParameters,
} from "relay-runtime";
import useMutationWithErrorMessage from "./useMutationWithErrorMessage";

const debouncedMutationMap = new Map<string, Disposable>();

export interface DebouncedMutationConfig<TMutation extends MutationParameters>
  extends MutationConfig<TMutation> {
  debounceKey: string;
  cacheConfig: CacheConfigWithDebounce;
}

export interface UseDebouncedMutationConfig<
  TMutation extends MutationParameters
> extends UseMutationConfig<TMutation> {
  debounceKey: string;
}

export default function useDebouncedMutation<
  TMutation extends MutationParameters
>(mutation: GraphQLTaggedNode, getErrorMessage: (relayError: Error) => string) {
  const commitMutationFn = (
    environment: IEnvironment,
    config: DebouncedMutationConfig<TMutation>
  ) => {
    const { debounceKey } = config;

    if (!debounceKey) {
      throw new Error(
        "debounceKey is required when using useDebouncedMutation"
      );
    }

    // Debounced mutations should be commited immediately to perform the optimisticUpdate
    // The actual request will be debounced in the network layer
    // Here we either dispose of a debounced mutation, or remove it from the map when it errors/completes
    const previousMutation = debouncedMutationMap.get(debounceKey);
    if (previousMutation) {
      previousMutation.dispose();
    }

    const commitConfig: DebouncedMutationConfig<TMutation> = {
      ...config,
      cacheConfig: {
        ...config.cacheConfig,
        debounceKey,
      },
      onError: (error) => {
        debouncedMutationMap.delete(debounceKey);
        config.onError?.(error);
      },
      onCompleted: (response, errors) => {
        debouncedMutationMap.delete(debounceKey);
        config.onCompleted?.(response, errors);
      },
    };

    const disposable = baseCommitMutation(environment, commitConfig);
    debouncedMutationMap.set(debounceKey, disposable);
    return disposable;
  };

  return useMutationWithErrorMessage(
    mutation,
    getErrorMessage,
    commitMutationFn
  ) as [(config: UseDebouncedMutationConfig<TMutation>) => Disposable, boolean];
}
