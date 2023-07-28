import { act, render, screen } from "@testing-library/react";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";

describe("The SessionExpiryHandler component", () => {
  it("renders the SessionTimeoutHandler component when a session is present and hides it when the session expires", async () => {
    let onSessionExpiredCallback;

    jest
      .spyOn(require("app/components/Session/SessionTimeoutHandler"), "default")
      .mockImplementation((props: any) => {
        onSessionExpiredCallback = props.onSessionExpired;
        return <div>Test Timeout Handler Render</div>;
      });

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

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

    await act(async () => {
      await render(<SessionExpiryHandler />);
    });

    expect(
      screen.queryByText("Test Timeout Handler Render")
    ).toBeInTheDocument();

    act(() => {
      onSessionExpiredCallback();
    });

    expect(
      screen.queryByText("Test Timeout Handler Render")
    ).not.toBeInTheDocument();
  });
});
