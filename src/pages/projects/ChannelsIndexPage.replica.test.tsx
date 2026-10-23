import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../components/Toast";
import { session } from "../../mock-data/users";
import { RouterProvider, type Router } from "../../routing/router";
import SessionProvider from "../../session/SessionProvider";
import ChannelsIndexPageReplica from "./ChannelsIndexPage.replica";

const navigate = vi.fn();
vi.mock("react-router-dom", async (original) => ({
  ...(await original<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const PROJECT = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";

describe("ChannelsIndexPageReplica", () => {
  it("closes the form after a save by replacing the history entry, so Back doesn't reopen it", async () => {
    const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/", search: "", hash: "" }) };
    render(
      <SessionProvider session={session}>
        <RouterProvider value={router}>
          <ToastProvider>
            <MemoryRouter initialEntries={[`/projects/${PROJECT}/channels/new`]}>
              <Routes>
                <Route path="/projects/:projectId/channels/new" element={<ChannelsIndexPageReplica />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </RouterProvider>
      </SessionProvider>
    );
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "new-channel" } });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "https://example.com" } });
    fireEvent.submit(document.getElementById("channel-form-new")!);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/projects/${PROJECT}/channels`, { replace: true }), { timeout: 2000 });
  });
});
