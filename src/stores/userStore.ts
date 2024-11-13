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
    role: string[];
    expiresIn: Date;
    Auth0Status: boolean;
    Auth0AccountId?: string;
    CompanyName?: string;
    CompanyId?: string;
    companyId?: string;
    companyName?: string;
    email?: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authResponse: JSON.parse(localStorage.getItem('user') || 'null') as AuthResponse | null,
    }),
    actions: {
        setAuthResponse(response: AuthResponse) {
            this.authResponse = response;
            localStorage.setItem('user', JSON.stringify(response));
        },
        isTokenValid(): boolean {
            if (!this.authResponse) return false; // Check directly on authResponse

            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const tokenExpirationTime = Math.floor(new Date(this.authResponse.expiresIn).getTime() / 1000);

            return currentTime < tokenExpirationTime;
        },
        getCompanyId(): string {
            const companyId = this.authResponse?.companyId ?? "";
            return companyId;
        },
        getCompanyName(): string {
            const companyName = this.authResponse?.companyName ?? "";
            return companyName;
        },
        getRoles(): string[] {
            return this.authResponse?.role ?? ['User'];
        },
        getUsername(): string {
            return this.authResponse?.email ?? 'Guest';
        },
        logout() {
            // Clear the state and localStorage
            this.authResponse = null;
            localStorage.removeItem('user');
        },
    },
});
