import { Network, Environment, Store, RecordSource } from "relay-runtime";

export function createServerNetwork({ cookieHeader }) {
  return Network.create(async (params, variables) => {
    console.log(cookieHeader);
    console.log("params", params);
    console.log("variables", variables);
    const response = await fetch("http://localhost:3004/graphql", {
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
