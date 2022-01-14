import { act, render } from "@testing-library/react";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";

describe("The SessionExpiryHandler component", () => {
  it("renders the SessionTimeoutHandler component when a session is present", () => {
    const mockSessionTimeoutHandler = jest
      .fn()
      .mockImplementation(() => <div>aaa</div>);

    jest
      .spyOn(require("@bcgov-cas/sso-react"), "SessionTimeoutHandler")
      .mockImplementation(() => mockSessionTimeoutHandler);

    jest
      .spyOn(require("next/router"), "useRouter")
      .mockImplementation(() => jest.fn());

    jest.spyOn(require("react-relay"), "fetchQuery").mockImplementation(() => {
      return {
        toPromise: () => {
          return { session: true };
        },
      };
    });
    jest
      .spyOn(require("react-relay"), "useRelayEnvironment")
      .mockImplementation(() => jest.fn());

    let componentUnderTest;
    act(() => {
      componentUnderTest = render(
        <SessionExpiryHandler></SessionExpiryHandler>
      );
    });

    expect(componentUnderTest.container).toMatchSnapshot();
    expect(mockSessionTimeoutHandler).toHaveBeenCalledTimes(1);
  });

  it("doesn't render the SessionTimeoutHandler component after the session expires", () => {});
});
