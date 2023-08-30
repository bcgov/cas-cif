import { Network, Environment, Store, RecordSource } from "relay-runtime";
import getConfig from "next/config";
const {
  serverRuntimeConfig: { PORT },
  publicRuntimeConfig: { SESSION_SECRET },
} = getConfig();

export function createServerNetwork({ cookieHeader }) {
  console.log("$$$$$$$$cookieHeader", cookieHeader);

  console.log("getConfig()", getConfig());
  console.log(
    "spliting",
    cookieHeader.split("; ")[1].replace("CSRF-TOKEN=", "")
  );
  console.log("SESSION_SECRET", SESSION_SECRET);
  return Network.create(async (params, variables) => {
    const response = await fetch(`http://localhost:${PORT}/graphql`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        "CSRF-TOKEN": SESSION_SECRET,
        // "CSRF-TOKEN": "_csrf",
        // "CSRF-TOKEN": cookieHeader.split("; ")[1].replace("CSRF-TOKEN=", ""),
        // "x-csrf-token": SESSION_SECRET,
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
