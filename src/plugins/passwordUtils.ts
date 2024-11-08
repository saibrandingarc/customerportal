// src/utils/passwordUtils.ts

// Function to check password complexity and return a message
export function checkPasswordComplexity(password: string): { isValid: boolean; message: string } {
    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const digitCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (!lengthCriteria) {
      return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!uppercaseCriteria) {
      return { isValid: false, message: 'Password must include at least one uppercase letter.' };
    }
    if (!lowercaseCriteria) {
      return { isValid: false, message: 'Password must include at least one lowercase letter.' };
    }
    if (!digitCriteria) {
      return { isValid: false, message: 'Password must include at least one number.' };
    }
    if (!specialCharCriteria) {
      return { isValid: false, message: 'Password must include at least one special character.' };
    }
  
    return { isValid: true, message: '' };
}

export function checkPasswordsMatch(password: string, confirmPassword: string): { isValid: boolean; message: string } {
    if (password !== confirmPassword) {
        return { isValid: false, message: "Passwords don't match." };
    }
    return { isValid: true, message: '' };
}
  