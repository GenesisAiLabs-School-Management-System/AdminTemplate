import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "@/api/services/authService";
import { User } from "@/types/auth"; // Your frontend User type

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; // Derived state
  isLoading: boolean; // Tracks initial load AND ongoing auth actions like refresh
  error: string | null;
  initiateLoginRedirect: () => Promise<void>; // Start the OIDC flow
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>; // Manually trigger user fetch/state refresh
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading until initial check is done
  const [error, setError] = useState<string | null>(null);

  // --- Derived State ---
  const isAuthenticated = !!user;

  // --- Core Function to Fetch and Set User ---
  const fetchAndSetUser = useCallback(
    async (attemptRefresh = false): Promise<User | null> => {
      console.log(
        `AuthProvider: fetchAndSetUser (attemptRefresh: ${attemptRefresh})`
      );
      setError(null); // Clear previous errors on fetch attempt
      let currentUser: User | null = null;
      try {
        const tokens = localStorage.getItem("auth_tokens");
        if (!tokens) {
          console.log("AuthProvider: No tokens found.");
          setUser(null); // Ensure user is null if no tokens
          return null;
        }

        currentUser = await authService.getCurrentUser();

        // If getCurrentUser fails (returns null, maybe due to expired token)
        // and we are allowed to attempt refresh
        if (!currentUser && attemptRefresh) {
          console.log(
            "AuthProvider: getCurrentUser failed, attempting token refresh..."
          );
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            console.log(
              "AuthProvider: Token refresh successful, retrying getCurrentUser..."
            );
            // Retry fetching user info with the new token
            currentUser = await authService.getCurrentUser();
          } else {
            console.log("AuthProvider: Token refresh failed.");
            // Logout should have cleared tokens in authService.refreshToken failure case
            setUser(null); // Ensure user is null if refresh fails
          }
        }

        setUser(currentUser); // Set user state (null if fetch/refresh failed)
        console.log("AuthProvider: User state updated:", currentUser);
        return currentUser; // Return the final user state
      } catch (err) {
        console.error("AuthProvider: Error during fetchAndSetUser", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user session."
        );
        setUser(null); // Clear user state on unexpected error
        // Don't necessarily clear tokens here, might be a temporary network issue
        return null;
      }
    },
    []
  ); // useCallback with empty dependencies

  // --- Initial Authentication Check ---
  useEffect(() => {
    console.log("AuthProvider: Running initial auth check...");
    setIsLoading(true);
    // Attempt fetch, but don't trigger refresh on initial load
    // Let interceptors handle refresh if needed during subsequent API calls
    fetchAndSetUser(false).finally(() => {
      console.log("AuthProvider: Initial auth check complete.");
      setIsLoading(false);
    });
  }, [fetchAndSetUser]);

  // --- Authentication Actions ---
  const initiateLoginRedirect = async () => {
    console.log("AuthProvider: Initiating login redirect...");
    setError(null);
    setIsLoading(true); // Indicate loading for the redirect action
    try {
      await authService.initiateLogin();
      // Redirect happens in the browser, state updates on callback
    } catch (err) {
      console.error("AuthProvider: Failed to initiate login redirect", err);
      setError(
        err instanceof Error ? err.message : "Failed to start login process."
      );
      setIsLoading(false); // Set loading false if redirect fails
    }
  };

  const logout = async () => {
    console.log("AuthProvider: Logging out...");
    setError(null);
    // No need to set loading true for logout typically
    try {
      await authService.logout(); // Clears tokens in service
    } catch (err) {
      console.error("AuthProvider: Error during service logout", err);
    } finally {
      setUser(null); // Clear user state in context
      // Optionally navigate to login page
      window.location.href = "/login"; // Force reload to ensure clean state
      console.log("AuthProvider: User logged out, state cleared.");
    }
  };

  // Manually trigger a refresh of user data, allowing token refresh attempt
  const refreshAuth = useCallback(async () => {
    console.log("AuthProvider: Refreshing auth state...");
    setIsLoading(true);
    await fetchAndSetUser(true); // Allow token refresh attempt
    setIsLoading(false);
  }, [fetchAndSetUser]);

  // --- Provide Context Value ---
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated, // Use the derived value
        isLoading,
        error,
        initiateLoginRedirect, // Provide the redirect function
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
