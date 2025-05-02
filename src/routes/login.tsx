import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { initiateLoginRedirect, isLoading, error, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "LoginPage Component: Already authenticated, navigating to home..."
      );
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleLoginClick() {
    console.log("Login button clicked, calling initiateLoginRedirect...");
    initiateLoginRedirect();
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && !isLoading && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLoginClick}
          disabled={isLoading}
          className={`w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md 
                      font-medium transition-colors hover:bg-primary/90 
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                      focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`}
        >
          {isLoading ? "Processing..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
