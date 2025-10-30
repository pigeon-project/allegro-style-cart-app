import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CartItemDemo from "./CartItemDemo";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CartItemDemo />
    </QueryClientProvider>
  </StrictMode>,
);
