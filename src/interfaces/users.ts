export interface User {
    Id: number;
    Email: string;
    Password: string;
    Otp: string | null;
    ZohoEmailStatus: boolean;
    OTPStatus: boolean;
    Auth0Status: boolean;
    Auth0AccountId: string | null;
    CompanyName: string;
    CompanyId: number;
  }