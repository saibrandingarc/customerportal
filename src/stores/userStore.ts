import { defineStore } from 'pinia';
import { AnyAuthResponse } from '@/interfaces/AnyAuthResponse';
// {
//     "https://tech-brandingarc.us.auth0.comroles": [],
//     "given_name": "Sai",
//     "family_name": "Krishna",
//     "nickname": "saikrishnaporala",
//     "name": "Sai Krishna",
//     "picture": "https://lh3.googleusercontent.com/a/ACg8ocKZv1cLNYCawP8Seweyc52IPEVzuVVloobVXDEL04b4-T3INWdB=s96-c",
//     "updated_at": "2024-11-18T08:47:40.226Z",
//     "email": "saikrishnaporala@gmail.com",
//     "email_verified": true,
//     "sub": "google-oauth2|105380281382852570494",
//     "access_token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly90ZWNoLWJyYW5kaW5nYXJjLnVzLmF1dGgwLmNvbS8ifQ..V_9NjzGL6LdX-Qt3.Lq7RY_-dJLUBH6paBNrpEpo-ZHL91Nq49oo3dBS_7YeW4sTNAnGgQqKOg4Zl_AM5mXwiLmmKO6No3IyiS9Xg5X7AIQlpQu4Ivhz7lPYLIFIQ0MNykhkEnhgPTubblZh_21P-thWT5rtlF2z_icMhEB1LBu0Waj6mAofpUFjdIieP_qSoYnkMyX_l8mYF5F-4H5xh0biCHFAipVKOQoKEZ0qr9jR4S7XKYIdTPM-cZbLve8bK54wYpUJ6e47BiZhFuLnZvD5vfaNomum8_O1qEUaQ17krxex-u_SKHqxGHrffZcHTTpv8ZoW8U7_PIPpRxSAyjL4raDjcNjdMBkUc.cGpglPXPVkYOuZW1bm6YmQ",
//     "companyId": "3293516000108143104",
//     "companyName": "Pork Chop Express"
// }

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authResponse: JSON.parse(localStorage.getItem('user') || 'null') as AnyAuthResponse | null,
    }),
    actions: {
        setAuthResponse(response: AnyAuthResponse) {
            this.authResponse = response;
            localStorage.setItem('user', JSON.stringify(response));
        },
        setUserData(response: AnyAuthResponse) {
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
            this.authResponse = JSON.parse(localStorage.getItem('user') || 'null');
            return this.authResponse?.username ?? 'Guest';
        },
        logout() {
            // Clear the state and localStorage
            this.authResponse = null;
            localStorage.clear();
            localStorage.removeItem('user');
        },
    },
});
