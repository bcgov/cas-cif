import { Environment, RecordSource, Store } from "relay-runtime";
import { hydrateRelayEnvironment } from "relay-nextjs";
import {
  RelayNetworkLayer,
  urlMiddleware,
  batchMiddleware,
  cacheMiddleware,
  uploadMiddleware,
} from "react-relay-network-modern/node8";
import debounceMutationMiddleware from "./debounceMutationMiddleware";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";

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
    uploadMiddleware(),
    batchMiddleware({
      batchUrl: async () => Promise.resolve("/graphql"),
      batchTimeout: 10,
      allowMutations: false,
    }),
  ]);

  return network;
}

let clientEnv: Environment | undefined;
export function getClientEnvironment(): RelayModernEnvironment {
  if (typeof window === "undefined") return null;

  if (clientEnv == null) {
    clientEnv = new Environment({
      network: createClientNetwork(),
      // removed `getRelaySerializedState` in favor of new API: https://github.com/RevereCRE/relay-nextjs/releases/tag/v1.0.0
      store: new Store(new RecordSource()),
      isServer: false,
    });
    hydrateRelayEnvironment(clientEnv);
  }

  return clientEnv;
}
