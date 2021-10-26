import { getClientEnvironment } from "./client";

const withRelayOptions = {
  fallback: <div>Loading...</div>,
  createClientEnvironment: () => getClientEnvironment()!,
  createServerEnvironment: async (ctx) => {
    const { createServerEnvironment } = await import("./server");
    return createServerEnvironment({ cookieHeader: ctx.req.headers.cookie });
  },
};

export default withRelayOptions;
