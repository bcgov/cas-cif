import { Network, Environment, Store, RecordSource } from "relay-runtime";
import getConfig from "next/config";

const {
  serverRuntimeConfig: { PORT },
} = getConfig();

export function createServerNetwork({ cookieHeader }) {
  return Network.create(async (params, variables) => {
    const response = await fetch(`http://localhost:${PORT}/graphql`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        query: params.text,
        variables,
      }),
    });

    try {
      return await response.json();
    } catch (e) {
      console.error(e);
    }
  });
}

export function createServerEnvironment(serverSideProps) {
  return new Environment({
    network: createServerNetwork(serverSideProps),
    store: new Store(new RecordSource()),
    isServer: true,
  });
}
