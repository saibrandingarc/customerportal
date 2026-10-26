<template>
  <div class="login-page">
    <div class="login-backdrop" aria-hidden="true"></div>
    <div v-if="loading" class="spinner-overlay">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <header class="login-brand">
      <img src="@/assets/logo.png" alt="Branding Arc" />
    </header>

    <main class="login-main">
      <div class="login-panel">
        <h1>Welcome back!</h1>
        <p class="login-subtitle">Please login to your account</p>

        <p v-if="errorMessage" class="login-error" role="alert">
          <i class="mdi mdi-alert-circle-outline" aria-hidden="true"></i>
          <span>{{ errorMessage }}</span>
        </p>

        <form @submit.prevent="submit" novalidate>
          <div class="login-field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="name@company.com"
              :class="{ 'is-invalid': errorMessage && !email }"
              required
            />
          </div>

          <div class="login-field">
            <label for="password">Password</label>
            <div class="login-password">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                :class="{ 'is-invalid': errorMessage && !password }"
                required
              />
              <button
                type="button"
                class="login-eye"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'mdi mdi-eye-off-outline' : 'mdi mdi-eye-outline'" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <p class="login-forgot">
            Forgot Password?
            <a href="/forgot_password">Reset</a>
          </p>

          <button type="submit" class="login-submit">Login</button>
        </form>

        <div class="login-divider">
          <span>Don't have an account?</span>
        </div>

        <a href="/register" class="login-outline">Register</a>

        <div class="login-social">
          <p>Login via</p>
          <div class="login-social-actions">
            <button type="button" class="btn btn-danger login-social-btn" @click="loginWithGoogle" aria-label="Login with Google">
              <i class="mdi mdi-google"></i>
            </button>
            <button type="button" class="btn login-social-btn login-social-btn--linkedin" @click="loginWithLinkedIn" aria-label="Login with LinkedIn">
              <i class="mdi mdi-linkedin"></i>
            </button>
          </div>
        </div>

        <div class="login-legal">
          <a href="/enduser" target="_blank">End-user license agreement</a>
          <a href="https://brandingarc.com/privacy-policy/" target="_blank">Privacy Policy</a>
        </div>
      </div>
    </main>
  </div>
</template>

  
<script lang="ts" setup>
    import { ref, onMounted, onUnmounted, Ref, computed, watch } from 'vue';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import axios from 'axios';
    import authConfig from "../../auth_config.json";
    import router from '@/router';
    import { useAuthStore } from '@/stores/userStore';
    import { checkPasswordComplexity } from '@/plugins/passwordUtils';
    import { useAuth0, User } from "@auth0/auth0-vue";
    import { AnyAuthResponse } from '@/interfaces/AnyAuthResponse';
    import { API_BASE_URL } from '@/api/config';
    import { markOutstandingApprovalsNotice } from '@/composables/useOutstandingApprovals';
    
    const { loginWithRedirect, isAuthenticated, logout, user, getAccessTokenSilently, handleRedirectCallback } = useAuth0();
    const userData = ref<any>(null);
    const tokenValid = ref(false);

    // Define the AuthResponse object with default values
    const authResponseTemp = ref<AnyAuthResponse>({
        access_token: '',
        id_token: '',
        scope: '',
        expires_in: 0,
        token_type: '',
        userId: '',
        username: null,
        email: '',
        role: [],
        expiresIn: '',
        auth0Status: false,
        auth0AccountId: '',
        companyName: '',
        companyId: ''
    });

    const validateToken = async () => {
        try {
            // Get the access token
            const token = await getAccessTokenSilently();
            
            // Add logic to validate token, e.g., checking expiration (optional)
            if (token) {
                tokenValid.value = true;
            }
        } catch (error) {
            console.log("Error validating token:", error);
        }
    };

    const logoutUser = () => {
        logout({ returnTo: window.location.origin });
    };

    // Function to check user and redirect
    const checkUserAndRedirect = () => {
        if (user.value?.sub && tokenValid.value) {
            markOutstandingApprovalsNotice();
            router.push("/dashboard"); // Redirect to another screen
        } else {
            console.error("User not valid or token invalid.");
        }
    };

    const authStore = useAuthStore();

    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const otp = ref('');
    const valid = ref(false);
    const emailVerified = ref(false);
    const otpVerified = ref(true);
    const loading = ref<boolean>(false);

    const errorMessage = ref<string | null>(null);

    const accountLockoutMessage = (err: unknown): string | null => {
        if (!axios.isAxiosError(err) || err.response?.status !== 423) {
            return null;
        }
        const data = err.response.data as { message?: string } | undefined;
        return data?.message || 'Your account is locked after too many failed login attempts. Try again later.';
    };

    const rules = {
        required: (value: string) => !!value || 'Required.',
        email: (value: string) => {
            const pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            return pattern.test(value) || 'Invalid e-mail.';
        },
    };
    
    const submit = async () => {
        loading.value = true;
        if (email.value && password.value) {
            try {
                const response = await axios.post(API_BASE_URL+'/Zoho/zoho/login', {
                    email: email.value,
                    password: password.value
                });
                if(response.status == 200) {
                    console.log(isAuthenticated);
                    localStorage.setItem("loginType", "username-password");
                    authStore.setAuthResponse(response.data);
                    isAuthenticated.value = authStore.isTokenValid();
                    errorMessage.value = "";
                    markOutstandingApprovalsNotice();
                    router.push("/dashboard");
                } else {
                    errorMessage.value = "Please check your credentials";
                    console.log("failed");
                }
                loading.value = false;
            } catch (err) {
                errorMessage.value = accountLockoutMessage(err) ?? "Please check your credentials";
            } finally {
                loading.value = false;
            }
        } else {
            loading.value = false;
            alert('Please enter your password.');
        }
    };

    const recordSocialLoginFailure = async (provider: string, reason: string, emailAddress?: string) => {
        if (!emailAddress) {
            return false;
        }

        try {
            await axios.post(API_BASE_URL + '/Zoho/zoho/login-failure', {
                email: emailAddress,
                logintype: provider,
                details: reason
            });
            return false;
        } catch (err) {
            const lockedMessage = accountLockoutMessage(err);
            if (lockedMessage) {
                errorMessage.value = lockedMessage;
                return true;
            }
            console.error("Failed to record social login failure", err);
            return false;
        }
    };

    const loginWithGoogle = async () => {
        try {
            localStorage.setItem("loginType", "google");
            await loginWithRedirect({
                authorizationParams: {
                    scope: 'openid profile email',
                    connection: "google-oauth2"
                },
            });
            await handleRedirectCallback();
            // Ensure the user is authenticated
            if (isAuthenticated.value) {
                authResponseTemp.value.access_token = await getAccessTokenSilently();

                email.value = user.value?.email ?? '';
                const zohoInfo = await verifyEmail();
                console.log(zohoInfo);

                if (zohoInfo === 'locked') {
                    logout();
                    return;
                }

                if (!zohoInfo) {
                    const locked = await recordSocialLoginFailure("google", "Google auth succeeded but user is not linked in app.", email.value);
                    if (!locked) {
                        errorMessage.value = "Email not exist, please contact support@brandingarc.com";
                    }
                    logout();
                    return;
                }

                authResponseTemp.value.companyId = zohoInfo.CompanyId;
                authResponseTemp.value.companyName = zohoInfo.CompanyName;
                localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
                console.log(authResponseTemp);
                checkUserAndRedirect();
            } else {
                await recordSocialLoginFailure("google", "Google login failed at provider callback.", user.value?.email);
                router.push("/login"); // Redirect to login if not authenticated
            }
        } catch (err) {
            const locked = await recordSocialLoginFailure("google", "Google login exception occurred.", user.value?.email || email.value);
            if (!locked) {
                errorMessage.value = "Google login failed. Please try again.";
            }
            console.error("Google login error:", err);
        }
    };

    const loginWithMicrosoft = async () => {
        // loginWithRedirect({
        //     connection: "microsoft", // Specify Microsoft as the connection
        // });
        localStorage.setItem("loginType", "microsoft");
        await loginWithRedirect({ connection: 'microsoft' });
        await handleRedirectCallback();
        // Ensure the user is authenticated
        if (isAuthenticated.value) {
            authResponseTemp.value.access_token = await getAccessTokenSilently();
            email.value = user.value?.email ?? '';

            const zohoInfo = await verifyEmail();
            console.log(zohoInfo);
            if (zohoInfo === 'locked') {
                logout();
                return;
            }
            if (!zohoInfo) {
                router.push("/login");
                return;
            }
            authResponseTemp.value.companyId = zohoInfo.CompanyId;
            authResponseTemp.value.companyName = zohoInfo.CompanyName;
            localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
            console.log(authResponseTemp);
            checkUserAndRedirect();
        } else {
            router.push("/login"); // Redirect to login if not authenticated
        }
    };

    const loginWithAzure = () => {
        loginWithRedirect({
            connection: "CustomerPortal", // Specify Microsoft as the connection
        });
    };

    const loginWithLinkedIn = async () => {
        try {
            localStorage.setItem("loginType", "linkedin");
            await loginWithRedirect({
                authorizationParams: {
                    scope: 'openid profile email',
                    connection: "linkedin"
                },
            });
            await handleRedirectCallback();
            // Ensure the user is authenticated
            if (isAuthenticated.value) {
                authResponseTemp.value.access_token = await getAccessTokenSilently();

                email.value = user.value?.email ?? '';
                const zohoInfo = await verifyEmail();
                console.log(zohoInfo);

                if (zohoInfo === 'locked') {
                    logout();
                    return;
                }

                if (!zohoInfo) {
                    const locked = await recordSocialLoginFailure("linkedin", "LinkedIn auth succeeded but user is not linked in app.", email.value);
                    if (!locked) {
                        errorMessage.value = "Email not exist, please contact support@brandingarc.com";
                    }
                    logout();
                    return;
                }

                authResponseTemp.value.companyId = zohoInfo.CompanyId;
                authResponseTemp.value.companyName = zohoInfo.CompanyName;
                localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
                console.log(authResponseTemp);
                checkUserAndRedirect();
            } else {
                await recordSocialLoginFailure("linkedin", "LinkedIn login failed at provider callback.", user.value?.email);
                router.push("/login"); // Redirect to login if not authenticated
            }
        } catch (err) {
            const locked = await recordSocialLoginFailure("linkedin", "LinkedIn login exception occurred.", user.value?.email || email.value);
            if (!locked) {
                errorMessage.value = "LinkedIn login failed. Please try again.";
            }
            console.error("LinkedIn login error:", err);
        }
    };

    const verifyEmail = async () => {
        loading.value = true;
        try {
            const response = await axios.post(API_BASE_URL+'/Zoho/zoho/checkEmail', {
                email: email.value,
                logintype: localStorage.getItem("loginType"),
                user: JSON.stringify(user.value)
            });
            if(response.data.obj != ""){
                const obj = JSON.parse(response.data.obj);
                return obj;
            } else {
                return null;
            }
        } catch (err) {
            const lockedMessage = accountLockoutMessage(err);
            if (lockedMessage) {
                errorMessage.value = lockedMessage;
                return 'locked';
            }
            console.log(err);
            // error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    watch(
        () => user.value,
        (newUser: unknown) => {
            if (newUser) {
                // Perform type casting only when `user.value` is available
                authResponseTemp.value = newUser as unknown as AnyAuthResponse;
            }
        },
        { immediate: true }
    );

    onMounted(async () => {
        document.body.classList.add("login-body");
        const logintype = localStorage.getItem("loginType");
        console.log(import.meta.env.VITE_API_URL);
        if(logintype == "username-password") {
            const authStore = useAuthStore();
            isAuthenticated.value = authStore.isTokenValid();
        } else {
            authResponseTemp.value.access_token = await getAccessTokenSilently();
            email.value = user.value?.email ?? '';
            const zohoInfo = await verifyEmail();
            console.log(zohoInfo);
            if (zohoInfo === 'locked') {
                logout();
                return;
            }
            if(zohoInfo != null) {
                authResponseTemp.value.companyId = zohoInfo.CompanyId;
                authResponseTemp.value.companyName = zohoInfo.CompanyName;
                localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
                console.log(authResponseTemp);
                if (isAuthenticated.value) {
                    markOutstandingApprovalsNotice();
                    router.push("/dashboard");
                } else {
                    logout();
                    errorMessage.value = "Email not exist, please contact support@brandingarc.com";
                }
            } else {
                logout();
                errorMessage.value = "Email not exist, please contact support@brandingarc.com";
            }
        }
    });

    onUnmounted(() => {
        document.body.classList.remove("login-body");
    });

    function validatePassword() {
        const result = checkPasswordComplexity(password.value);
        errorMessage.value = result.message;
    }
</script>
  
<style scoped>
    .login-page {
        position: relative;
        min-height: 100vh;
        background: var(--vz-white, #fff);
        color: var(--vz-body-color, #212529);
        font-size: 14px;
    }

    .login-backdrop {
        position: absolute;
        inset: 0;
        background: url('@/assets/login-people.jpg') center / cover no-repeat;
        opacity: 0.4;
        pointer-events: none;
    }

    .login-brand,
    .login-main {
        position: relative;
        z-index: 1;
    }

    :global(body.login-body) {
        margin-bottom: 0;
        background: var(--vz-white, #fff);
    }

    .login-brand {
        padding: 28px 36px 0;
    }

    .login-brand img {
        display: block;
        width: 168px;
        height: auto;
    }

    .login-main {
        display: flex;
        justify-content: center;
        padding: 56px 24px 48px;
    }

    .login-panel {
        position: relative;
        width: 100%;
        max-width: 440px;
        padding: 32px 28px 28px;
        border: 1px solid var(--vz-gray-300, #e9ebec);
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 8px 24px rgba(33, 37, 41, 0.08);
    }

    .login-panel h1 {
        margin: 0;
        text-align: center;
        font-size: 28px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--vz-body-color, #212529);
    }

    .login-subtitle {
        margin: 8px 0 0;
        text-align: center;
        color: var(--vz-secondary-color, #878a99);
        font-size: 14px;
    }

    .login-error {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: 6px;
        margin: 16px 0 0;
        color: var(--vz-danger, #ed5e5e);
        font-size: 13px;
        line-height: 1.4;
        text-align: center;
    }

    .login-error i {
        font-size: 16px;
        line-height: 1.2;
    }

    .login-field {
        margin-top: 18px;
    }

    .login-field label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: var(--vz-body-color, #212529);
    }

    .login-field input {
        width: 100%;
        height: 46px;
        padding: 0 14px;
        border: 1px solid var(--vz-gray-400, #ced4da);
        border-radius: 8px;
        background: var(--vz-white, #fff);
        color: var(--vz-body-color, #212529);
        font-size: 14px;
        outline: none;
        box-shadow: none;
    }

    .login-field input::placeholder {
        color: var(--vz-gray-500, #adb5bd);
    }

    .login-field input:focus {
        border-color: var(--vz-primary, #0192d0);
        box-shadow: 0 0 0 3px rgba(1, 146, 208, 0.15);
    }

    .login-field input.is-invalid {
        border-color: var(--vz-danger, #ed5e5e);
    }

    .login-password {
        position: relative;
    }

    .login-password input {
        padding-right: 42px;
    }

    .login-eye {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--vz-secondary-color, #878a99);
        cursor: pointer;
    }

    .login-eye i {
        font-size: 18px;
    }

    .login-forgot {
        margin: 10px 0 0;
        color: var(--vz-secondary-color, #878a99);
        font-size: 13px;
    }

    .login-forgot a {
        margin-left: 4px;
        color: var(--vz-primary, #0192d0);
        font-weight: 600;
        text-decoration: none;
    }

    .login-forgot a:hover {
        text-decoration: underline;
    }

    .login-submit {
        width: 100%;
        height: 48px;
        margin-top: 22px;
        border: 0;
        border-radius: 8px;
        background: var(--vz-primary, #0192d0);
        color: var(--vz-white, #fff);
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
    }

    .login-submit:hover {
        background: var(--vz-secondary, #04649c);
    }

    .login-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 22px 0;
        color: var(--vz-secondary-color, #878a99);
        font-size: 13px;
    }

    .login-divider::before,
    .login-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--vz-gray-300, #e9ebec);
    }

    .login-outline {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 48px;
        border: 1px solid var(--vz-gray-400, #ced4da);
        border-radius: 8px;
        background: var(--vz-white, #fff);
        color: var(--vz-body-color, #212529);
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
    }

    .login-outline:hover {
        background: var(--vz-light, #f3f6f9);
        color: var(--vz-body-color, #212529);
    }

    .login-social {
        margin-top: 28px;
        text-align: center;
    }

    .login-social p {
        margin: 0 0 10px;
        color: var(--vz-body-color, #212529);
        font-size: 14px;
        font-weight: 500;
    }

    .login-social-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .login-social-btn {
        width: 40px;
        height: 36px;
        padding: 0;
        border-radius: 4px;
    }

    .login-social-btn--linkedin {
        background: #0077b5;
        border-color: #0077b5;
        color: #fff;
    }

    .login-social-btn--linkedin:hover {
        background: #04649c;
        border-color: #04649c;
        color: #fff;
    }

    .login-legal {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 24px;
        margin-top: 28px;
    }

    .login-legal a {
        color: var(--vz-primary, #0192d0);
        font-size: 13px;
        text-decoration: none;
    }

    .login-legal a:hover {
        text-decoration: underline;
    }

    @media (max-width: 640px) {
        .login-brand {
            padding: 20px 20px 0;
        }

        .login-brand img {
            width: 140px;
        }

        .login-main {
            padding: 36px 20px 32px;
        }

        .login-panel h1 {
            font-size: 24px;
        }
    }
</style>
  