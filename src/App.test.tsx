import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ToastProvider } from "./components/Toast";
import { session } from "./mock-data/users";
import { ReactRouterAdapter } from "./routing/ReactRouterAdapter";
import SessionProvider from "./session/SessionProvider";

describe("App", () => {
  it("logs out to the log in page", async () => {
    render(
      <MemoryRouter initialEntries={["/users/log_out"]}>
        <ReactRouterAdapter>
          <SessionProvider session={session}>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SessionProvider>
        </ReactRouterAdapter>
      </MemoryRouter>
    );
    expect(await screen.findByRole("button", { name: "Log in" })).toBeTruthy();
  });
});
