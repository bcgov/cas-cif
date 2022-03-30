import { ErrorContext } from "contexts/ErrorContext";
import { useContext } from "react";
import { Environment, useMutation } from "react-relay";
import { commitMutation as baseCommitMutation } from "relay-runtime";
import {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  MutationConfig,
  MutationParameters,
} from "relay-runtime";
import * as Sentry from "@sentry/nextjs";

export default function useMutationWithErrorMessage<
  TMutation extends MutationParameters
>(
  mutation: GraphQLTaggedNode,
  getErrorMessage: (relayError: Error) => string,
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<TMutation>
  ) => Disposable
) {
  const { setError } = useContext(ErrorContext);
  const setErrorCommitMutationFn = (
    environment: IEnvironment,
    config: MutationConfig<TMutation>
  ) => {
    const commitConfig: MutationConfig<TMutation> = {
      ...config,
      onError: (error) => {
        config.onError?.(error);
        setError(getErrorMessage(error));
        Sentry.captureException(error);
      },
    };

    let disposable;
    if (commitMutationFn) {
      disposable = commitMutationFn(environment, commitConfig);
    } else {
      disposable = baseCommitMutation(environment, commitConfig);
    }

    return disposable;
  };

  return useMutation(mutation, setErrorCommitMutationFn);
}
