export interface AnyAuthResponse {
    access_token: string;
    id_token: string;
    scope: string;
    expires_in: number;
    token_type: string;
    userId: string;
    username: string | null;
    email: string;
    role: string[];
    expiresIn: string;
    auth0Status: boolean;
    auth0AccountId: string;
    companyName: string;
    companyId: string;
  }