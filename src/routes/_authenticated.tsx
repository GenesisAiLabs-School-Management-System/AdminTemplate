import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth if checking context here
// import { Suspense } from 'react';
// import { authService } from '@/api/services/authService'; // Import authService

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    console.log("[_authenticated] beforeLoad: Checking for token presence...");
    // Synchronous check for token key existence
    const tokenExists = !!localStorage.getItem("auth_tokens");

    if (!tokenExists) {
      console.log(
        "[_authenticated] beforeLoad: No token key found, redirecting to login."
      );
      // throw redirect({
      //   to: '/login',
      //   // search: { redirect: location.pathname + location.search }, // Preserve redirect? Adapt as needed
      //   replace: true,
      // });
    }
    console.log(
      "[_authenticated] beforeLoad: Token key found, proceeding to component render."
    );
    // Allow component to render for detailed check using useAuth
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth(); // Get logout from context

  console.log(
    `[_authenticated] Component: Rendering. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`
  );

  if (isLoading) {
    // Render a loading indicator while auth context confirms state
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading Session...</div>
      </div>
    );
  }

  // If component renders and is *still* not authenticated after loading, redirect.
  // This acts as the primary guard now.
  if (!isAuthenticated) {
    console.log(
      "[_authenticated] Component: NOT authenticated after load (token invalid/expired?). Clearing tokens and redirecting..."
    );
    // Explicitly logout to clear potentially invalid tokens before redirecting
    // logout(); // Call the logout function from context
    // NOTE: logout() in your context also does a hard redirect.
    // The throw redirect below might be redundant if logout forces navigation.
    // Consider removing the hard redirect from logout() in AuthContext
    // if you prefer router-based redirects.
    //  throw redirect({
    //     to: '/login',
    //     replace: true,
    //   });
  }

  console.log("[_authenticated] Component: Rendering AppLayout...");
  // AppLayout renders the Outlet internally, no need to pass children here
  return <AppLayout />;
}
