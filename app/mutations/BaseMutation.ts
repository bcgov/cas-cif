import {
  commitMutation as commitMutationDefault,
  GraphQLTaggedNode,
} from "react-relay";
import {
  DeclarativeMutationConfig,
  MutationParameters,
} from "relay-runtime";
import type { Environment } from "react-relay";

interface BaseMutationType extends MutationParameters {
  variables: { input: any; messages?: { success: string; failure: string } };
}

export default class BaseMutation<T extends BaseMutationType = never> {
  counter: number;

  mutationName: string;

  configs?: DeclarativeMutationConfig[];

  constructor(mutationName: string, configs?: DeclarativeMutationConfig[]) {
    this.mutationName = mutationName;
    this.counter = 0;
    this.configs = configs;
  }

  async performMutation(
    environment: Environment,
    mutation: GraphQLTaggedNode,
    variables: T["variables"],
    optimisticResponse?: any,
    updater?: (...args: any[]) => any
  ) {

    const { configs } = this;
    async function commitMutation(
      commitEnvironment,
      options: {
        mutation: GraphQLTaggedNode;
        variables: T["variables"];
        optimisticResponse: any;
        updater: any;
      }
    ) {
      return new Promise<T["response"]>((resolve, reject) => {
        commitMutationDefault<T>(commitEnvironment, {
          ...options,
          configs,
          onError: (error) => {
            reject(error);
          },
          onCompleted: (response, errors) => {
            if (errors)
              reject(errors)
            else
              resolve(response);
          },
        } as any);
      });
    }

    return commitMutation(environment, {
      mutation,
      variables,
      optimisticResponse,
      updater,
    });
  }
}
