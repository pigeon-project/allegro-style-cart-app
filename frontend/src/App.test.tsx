import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("App button", () => {
  it("increments the counter when clicking the Increment button", async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>,
    );

    // initial state
    expect(screen.getByText(/0\s*times/i)).toBeTruthy();

    // click the button
    const button = screen.getByRole("button", { name: /increment/i });
    await user.click(button);

    // updated state
    expect(screen.getByText(/1\s*times/i)).toBeTruthy();
  });
});
