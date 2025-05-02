import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { authService } from '@/api/services/authService';
import { useAuth } from '@/hooks/useAuth'; 

export const Route = createFileRoute('/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth(); // Get refresh function from context
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once when the component mounts after the redirect
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      //const state = urlParams.get('state'); // Optional: For CSRF protection
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // --- 1. Check for errors from Identity Provider ---
      if (errorParam) {
        console.error(`OAuth Error: ${errorParam} - ${errorDescription}`);
        setError(errorDescription || 'Login failed at the identity provider.');
        setStatus('error');
        // Clean up potentially stored state
        sessionStorage.removeItem('oauth_state');
        return;
      }

      // --- 2. Validate State (Optional but Recommended CSRF protection) ---
      // const expectedState = sessionStorage.getItem('oauth_state');
      // if (!state || !expectedState || state !== expectedState) {
      //   console.error('Invalid OAuth state parameter.');
      //   setError('Login session is invalid or expired. Please try again.');
      //   setStatus('error');
      //   sessionStorage.removeItem('oauth_state');
      //   return;
      // }
      // sessionStorage.removeItem('oauth_state'); // Clean up state

      // --- 3. Check for Authorization Code ---
      if (!code) {
        console.error('Authorization code not found in callback URL.');
        setError('Login process incomplete. Please try again.');
        setStatus('error');
        return;
      }

      // --- 4. Exchange Code for Tokens ---
      try {
        console.log("Callback: Exchanging code for tokens...");
        // authService.handleCallback should perform the POST to /connect/token
        // and store the tokens internally (e.g., localStorage)
        await authService.handleCallback(code);

        console.log("Callback: Token exchange successful.");
        setStatus('success');

        // Refresh auth state in context to load user info
        await refreshAuth();

        // Redirect to the intended destination (e.g., dashboard)
        // TODO: Potentially redirect to a stored 'returnUrl' if needed
        console.log("Callback: Navigating to dashboard...");
        navigate({ to: '/', replace: true }); // Use replace to remove callback from history

      } catch (err) {
        console.error('Callback: Failed to exchange code for tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete login. Please try again.');
        setStatus('error');
      }
    };

    processCallback();
    // We only want this effect to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, refreshAuth]); // Include navigate and refreshAuth in dependencies

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-xl font-semibold text-destructive mb-4">Login Error</h2>
        <p className="text-muted-foreground mb-6">{error || 'An unknown error occurred.'}</p>
        <button
          onClick={() => navigate({ to: '/login', replace: true })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Return to Login
        </button>
      </div>
    );
  }

  // Display loading indicator while processing
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Completing login, please wait...</p>
    </div>
  );
}