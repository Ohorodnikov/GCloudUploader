import * as jose from 'jose';

export interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const getAccessTokenFromServiceAccount = async (
  key: ServiceAccountKey
): Promise<string> => {
  try {
    // 1. Create the JWT Payload
    // The audience (aud) must be the token endpoint
    const tokenEndpoint = key.token_uri || 'https://oauth2.googleapis.com/token';
    const scope = 'https://www.googleapis.com/auth/devstorage.read_write';
    
    // 2. Import the Private Key using jose
    const privateKey = await jose.importPKCS8(key.private_key, 'RS256');

    // 3. Sign the JWT
    const jwt = await new jose.SignJWT({
      scope: scope,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(key.client_email)
      .setSubject(key.client_email)
      .setAudience(tokenEndpoint)
      .setIssuedAt()
      .setExpirationTime('1h') // Token request itself expires, not the resulting access token
      .sign(privateKey);

    // 4. Exchange JWT for Access Token via Google OAuth2 API
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Auth failed: ${errorData.error_description || response.statusText}`);
    }

    const data: TokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Token Exchange Error:", error);
    throw error;
  }
};

export const parseServiceAccountKey = (jsonString: string): ServiceAccountKey => {
  try {
    const key = JSON.parse(jsonString);
    if (!key.private_key || !key.client_email) {
      throw new Error("Invalid Service Account JSON: Missing private_key or client_email.");
    }
    return key as ServiceAccountKey;
  } catch (e) {
    throw new Error("Failed to parse Service Account JSON. Please ensure it is a valid JSON file.");
  }
};