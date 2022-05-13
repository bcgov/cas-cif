import { mocked } from "jest-mock";
import { NextRouter, useRouter } from "next/router";

const createMockNextRouter = (routerOpts: Partial<NextRouter>) => {
  const router = mocked(useRouter);
  router.mockReturnValue({
    ...routerOpts,
  } as any);
  return router;
};
export default createMockNextRouter;
