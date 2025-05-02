import identityApiClient from '../identityClient'; // Client for Identity API
import apiClient from '../apiClient'; // Assuming this is your Business API client
import { User, RegisterCredentials } from '@/types/auth'; // User type for frontend
import { generateCodeVerifier, generateCodeChallenge } from '@/utils/pkce'; // PKCE utils

// Get Identity API URL from environment variables
const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || 'https://localhost:7226'; // Ensure correct URL

// OIDC UserInfo endpoint response type
interface OidcUserInfoResponse {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  // roles?: string[]; // Add if roles are returned
}

// Stored token structure type
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // Timestamp (ms) when access token expires
}

export const authService = {

  /**
   * Initiates the OIDC Authorization Code Flow with PKCE.
   * Redirects the user to the Identity Provider's authorization endpoint.
   */
  async initiateLogin() {
    console.log("AuthService: Initiating login redirect...");
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem('code_verifier', codeVerifier); // Store verifier for callback

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl = new URL(`/connect/authorize`, IDENTITY_API_URL); // Use URL constructor correctly
    authUrl.searchParams.append('client_id', 'spa'); // Your SPA client ID
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', `${window.location.origin}/callback`); // Must match registration
    authUrl.searchParams.set('scope', 'api openid profile offline_access');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    // Optionally add state for CSRF protection
    // const state = crypto.randomUUID();
    // sessionStorage.setItem('oauth_state', state);
    // authUrl.searchParams.append('state', state);

    // Perform the redirect
    window.location.href = authUrl.toString();
  },

  /**
   * Handles the callback from the Identity Provider after authentication.
   * Exchanges the authorization code for tokens using the /connect/token endpoint.
   */
  async handleCallback(code: string): Promise<AuthTokens> {
    const codeVerifier = localStorage.getItem('code_verifier');
    if (!code || !codeVerifier) {
       throw new Error('Authorization code or verifier missing.');
    }
    console.log("AuthService: Handling callback, exchanging code...");

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `${window.location.origin}/callback`);
    params.append('client_id', 'spa');
    params.append('code_verifier', codeVerifier);

    try {
      const response = await identityApiClient.post('/connect/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log("AuthService: Token exchange successful.");
      console.log(response.data);

      if (response.data.access_token && response.data.refresh_token) {
         const tokens: AuthTokens = {
             accessToken: response.data.access_token,
             refreshToken: response.data.refresh_token,
             expiresAt: Date.now() + (response.data.expires_in * 1000)
         };
         localStorage.setItem('auth_tokens', JSON.stringify(tokens)); // Store the tokens object
         localStorage.removeItem('code_verifier'); // Clean up verifier
         return tokens; // Return the new tokens
      } else {
         throw new Error("Token endpoint did not return expected tokens.");
      }
    } catch (error: any) {
      console.error("AuthService: Token exchange failed.", error.response?.data || error.message);
      localStorage.removeItem('code_verifier'); // Clean up verifier on error too
      throw new Error(`Authentication failed during token exchange: ${error.response?.data?.error_description || error.message}`);
    }
  },

  /**
   * Fetches user information from the OIDC /connect/userinfo endpoint.
   */
  async getCurrentUser(): Promise<User | null> {
    const tokenData = JSON.parse(localStorage.getItem('auth_tokens') || '{}') as Partial<AuthTokens>;
    const accessToken = tokenData?.accessToken;

    if (!accessToken) {
      console.log("AuthService: No access token found for getCurrentUser.");
      return null;
    }

    try {
      console.log("AuthService: Fetching user info from /connect/userinfo");
      const response = await identityApiClient.get<OidcUserInfoResponse>('/connect/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      console.log("AuthService: User info received:", response.data);

      // Map OIDC claims to frontend User type
      const user: User = {
        id: response.data.sub,
        username: response.data.name || response.data.email || response.data.sub,
        email: response.data.email || '',
        firstName: (response.data as any).given_name || '', // Map from given_name or fallback
        lastName: (response.data as any).family_name || '', // Map from family_name or fallback
        roles: [], // TODO: Map roles if available
      };
      return user;
    } catch (error: any) {
      console.error("AuthService: Failed to fetch user info.", error.response?.data || error.message);
      if (error.response?.status === 401) {
         console.log("AuthService: Received 401 on userinfo, token might be invalid/expired.");
         // Consider triggering logout or refresh based on your strategy
         localStorage.removeItem('auth_tokens'); // Clear potentially invalid tokens
      }
      return null;
    }
  },

  /**
   * Uses the refresh token to obtain new access and refresh tokens.
   */
  async refreshToken(): Promise<AuthTokens | null> {
    const tokenData = JSON.parse(localStorage.getItem('auth_tokens') || '{}') as Partial<AuthTokens>;
    const refreshToken = tokenData?.refreshToken;

    if (!refreshToken) {
      console.log("AuthService: No refresh token available.");
      return null;
    }

    console.log("AuthService: Attempting token refresh...");
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', 'spa'); // Client ID might be required

    try {
      const response = await identityApiClient.post('/connect/token', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log("AuthService: Token refresh successful.");

      if (response.data.access_token && response.data.refresh_token) {
         const newTokens: AuthTokens = {
             accessToken: response.data.access_token,
             refreshToken: response.data.refresh_token, // Usually gets a new refresh token too
             expiresAt: Date.now() + (response.data.expires_in * 1000)
         };
         localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
         return newTokens;
      } else {
         throw new Error("Refresh token endpoint did not return expected tokens.");
      }
    } catch (error: any) {
       console.error("AuthService: Token refresh failed.", error.response?.data || error.message);
       // If refresh fails (e.g., refresh token expired/revoked), log the user out
       await this.logout(); // Call logout to clear state and tokens
       return null;
    }
  },

  /**
   * Logs the user out by clearing stored tokens.
   * Optionally redirects to the OIDC end session endpoint.
   */
  async logout(): Promise<void> {
     console.log("AuthService: Logging out...");
     //const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}') as Partial<AuthTokens>;
     localStorage.removeItem('auth_tokens');
     localStorage.removeItem('code_verifier'); // Clean up just in case


     console.log("AuthService: Client-side logout complete.");
  },

  /**
   * Handles user registration.
   * NOTE: Assumes registration is handled by the BUSINESS API client.
   * If registration is via Identity API, use identityApiClient instead.
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    console.warn("AuthService: Register function using business apiClient. Adjust if needed.");
    // If registration endpoint is on Identity API, change to identityApiClient
    const response = await apiClient.post<User>('/auth/register', credentials); // Uses business apiClient
    // This likely won't return a user object suitable for direct login in OIDC flow
    // Usually after registration, the user needs to go through the login flow.
    return response.data;
  },

};