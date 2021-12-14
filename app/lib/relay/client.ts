import { Environment, RecordSource, Store } from "relay-runtime";
import { getRelaySerializedState } from "relay-nextjs";
import {
  RelayNetworkLayer,
  urlMiddleware,
  batchMiddleware,
  cacheMiddleware,
  uploadMiddleware,
} from "react-relay-network-modern/node8";
import debounceMutationMiddleware from "./debounceMutationMiddleware";

const oneMinute = 60 * 1000;

export function createClientNetwork() {
  const network = new RelayNetworkLayer([
    cacheMiddleware({
      size: 100, // Max 100 requests
      // Number in milliseconds, how long records stay valid in cache (default: 900000, 15 minutes).
      // TODO: is one minute enough? How long should records stay valid?
      ttl: oneMinute,
    }),
    urlMiddleware({
      url: async () => Promise.resolve("/graphql"),
    }),
    debounceMutationMiddleware(),
    batchMiddleware({
      batchUrl: async () => Promise.resolve("/graphql"),
      batchTimeout: 10,
      allowMutations: true,
    }),
    uploadMiddleware(),
  ]);

  return network;
}

let clientEnv: Environment | undefined;
export function getClientEnvironment() {
  if (typeof window === "undefined") return null;

  if (clientEnv == null) {
    clientEnv = new Environment({
      network: createClientNetwork(),
      store: new Store(new RecordSource(getRelaySerializedState()?.records)),
      isServer: false,
    });
  }

  return clientEnv;
}
