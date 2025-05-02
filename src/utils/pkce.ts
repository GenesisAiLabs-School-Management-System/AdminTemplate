
export function generateCodeVerifier(length = 64): string {
    // Define characters that can be used in the code verifier
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    
    // Generate a random string of specified length
    let text = '';
    const possibleLength = possible.length;
    
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possibleLength));
    }
    
    return text;
  }
  

  export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    // Convert string to buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hash));
    
    const hashString = hashArray
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    return btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  

  export function validateState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState;
  }