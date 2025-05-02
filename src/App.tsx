import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { UserSettingsProvider } from "./context/SettingContext";
import { RouterProvider } from "@tanstack/react-router";
import { useExtendedRouter } from "./hooks/useExtendedRouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient, router } from "@/app-providers.js";
import type { Router } from "@tanstack/react-router";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";

function InnerApp() {
  const auth = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extendedRouter = useExtendedRouter(router as Router<any>);
  const [isAppReady, setIsAppReady] = useState(false); // State for async initialization

  useEffect(() => {
    // Simulate essential async setup (e.g., loading config) if needed.
    // For Phase 1, we can assume it's ready quickly.
    console.log("InnerApp: Initializing...");
    const initialize = async () => {
      // Replace with actual async checks if necessary
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate loading
      console.log("InnerApp: Initialization complete.");
      setIsAppReady(true);
    };

    initialize();
  }, []);

  // Display loading state until app is ready
  if (!isAppReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Initializing Application...</div> {/* Basic loading indicator */}
      </div>
    );
  }

  console.log("InnerApp: Rendering RouterProvider...");
  return (
    <RouterProvider
      router={extendedRouter}
      context={{ auth, queryClient }} // Pass auth context and queryClient
    />
  );
}

/**
 * Root App component sets up global providers.
 */
export function App() {
  console.log("App: Rendering Providers...");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserSettingsProvider>
          <ThemeProvider defaultTheme="system">
            <InnerApp />
          </ThemeProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
