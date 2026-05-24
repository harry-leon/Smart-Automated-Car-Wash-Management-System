import { Suspense, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

createRoot(root).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
          Loading application...
        </div>
      }
    >
      <RouterProvider router={getRouter()} />
    </Suspense>
  </StrictMode>,
);
