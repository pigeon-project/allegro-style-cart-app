import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../theme";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

describe("Cart Page", () => {
  it("renders without crashing", async () => {
    const queryClient = new QueryClient();
    const router = createRouter({ routeTree });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    // Just verify the router renders something
    expect(container).toBeTruthy();
  });
});
