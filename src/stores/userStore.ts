import { defineStore } from 'pinia';

export interface AuthResponse {
    access_token: string;
    id_token: string;
    scope: string;
    expires_in: number;
    token_type: string;
    UserId: string;
    Username: string;
    Email: string;
    Role: string;
    ExpiresIn: Date;
    Auth0Status: boolean;
    Auth0AccountId?: string;
    CompanyName?: string;
    CompanyId?: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authResponse: {} as AuthResponse | null,
    }),
    actions: {
        setAuthResponse(response: AuthResponse) {
            this.authResponse = response;
        },
        isTokenValid(): boolean {
            if (!this.authResponse) return false; // Check directly on authResponse

            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const tokenExpirationTime = Math.floor(new Date(this.authResponse.ExpiresIn).getTime() / 1000);

            return currentTime < tokenExpirationTime;
        },
    },
});
