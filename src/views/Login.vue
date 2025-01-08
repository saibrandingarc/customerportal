<template>
    <v-container fluid fill-height>
        <!-- Loading Spinner -->
        <div v-if="loading" class="spinner-overlay">
            <div class="spinner"></div>
        </div>
        <v-row align="center" justify="center" style="height: 100vh;">
            <v-col cols="12" sm="8" md="4">
                <v-card>
                    <!-- Logo Section -->
                    <v-card-title class="d-flex justify-center">
                        <img src="@/assets/logo.png" alt="Logo" class="logo1" />
                    </v-card-title>
                    <v-card-title>
                        <h2 class="text-h5 text-center">Login</h2>
                    </v-card-title>
  
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field v-model="email" label="Email" variant="outlined" :rules="[rules.required, rules.email]" required></v-text-field>
                            <v-text-field v-model="password" label="Password" variant="outlined" :rules="[rules.required]" type="password" required></v-text-field>
                        </v-form>
                        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
                        <a href="/forgot_password" style="float: inline-end;">Forgot Password?</a><br>
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center">
                        <v-btn class="text-none mb-4" color="indigo-darken-3" size="large" variant="flat" @click="submit">Login</v-btn>
                    </v-card-actions>
                    <a href="/register" class="d-flex justify-center">Register</a><br>
                    <v-card-footer class="d-flex justify-center">
                        <v-btn class="text-none mb-4 mr-2" color="indigo-darken-3" size="default" variant="flat" @click="loginWithGoogle">Google Sign In</v-btn>
                        <v-btn class="text-none mb-4 mr-2" color="indigo-darken-3" size="default" variant="flat" @click="loginWithLinkedIn">LinkedIn Sign In</v-btn><br/>
                    </v-card-footer>
                    <v-card-footer class="d-flex justify-center">
                        <v-btn class="text-none mb-4 mr-2" color="indigo-darken-3" size="default" variant="flat" @click="loginWithMicrosoft">Microsoft Sign In</v-btn>
                        <v-btn class="text-none mb-4" color="indigo-darken-3" size="default" variant="flat" @click="loginWithAzure">Microsoft Azure Sign In</v-btn>
                    </v-card-footer>
                    <div v-if="isAuthenticated">
                        <p>Welcome, {{ user }}</p>
                        <button @click="logoutUser">Logout</button>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
    import { ref, onMounted, Ref, computed, watch } from 'vue';
    import axios from 'axios';
    import authConfig from "../../auth_config.json";
    import router from '@/router';
    import { useAuthStore } from '@/stores/userStore';
    import { checkPasswordComplexity } from '@/plugins/passwordUtils';
    import { useAuth0, User } from "@auth0/auth0-vue";
    import { AnyAuthResponse } from '@/interfaces/AnyAuthResponse';
    
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
            router.push("/dashboard"); // Redirect to another screen
        } else {
            console.error("User not valid or token invalid.");
        }
    };

    const authStore = useAuthStore();

    const email = ref('');
    const password = ref('');
    const otp = ref('');
    const valid = ref(false);
    const emailVerified = ref(false);
    const otpVerified = ref(true);
    const loading = ref<boolean>(false);

    const errorMessage = ref<string | null>(null);

    const rules = {
        required: (value: string) => !!value || 'Required.',
        email: (value: string) => {
            const pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            return pattern.test(value) || 'Invalid e-mail.';
        },
    };
    
    const submit = async () => {
        loading.value = true;
        if (valid.value && password.value) {
            try {
                const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/login', {
                    email: email.value,
                    password: password.value
                });
                if(response.status == 200) {
                    console.log(isAuthenticated);
                    localStorage.setItem("loginType", "username-password");
                    authStore.setAuthResponse(response.data);
                    isAuthenticated.value = authStore.isTokenValid();
                    errorMessage.value = "";
                    router.push({ name: 'dashboard' });
                } else {
                    errorMessage.value = "Please check your credentials";
                    console.log("failed");
                }
                loading.value = false;
            } catch (err) {
                // error.value = err.message;
            } finally {
                loading.value = false;
            }
        } else {
            loading.value = false;
            alert('Please enter your password.');
        }
    };

    const loginWithGoogle = async () => {
        localStorage.setItem("loginType", "google");
        await loginWithRedirect({
            connection: "google-oauth2",
            state: JSON.stringify({ loginType: "google" }),
            authorizationParams: {
                scope: 'openid profile email',
            },
        });
        await handleRedirectCallback();
        // Ensure the user is authenticated
        if (isAuthenticated.value) {
            authResponseTemp.value.access_token = await getAccessTokenSilently();

            email.value = user.value?.email ?? '';
            const zohoInfo = await verifyEmail();
            console.log(zohoInfo);
            authResponseTemp.value.companyId = zohoInfo.CompanyId;
            authResponseTemp.value.companyName = zohoInfo.CompanyName;
            localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
            console.log(authResponseTemp);
            checkUserAndRedirect();
        } else {
            router.push("/login"); // Redirect to login if not authenticated
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
        localStorage.setItem("loginType", "linkedin");
        await loginWithRedirect({ connection: 'linkedin' });
        await handleRedirectCallback();
        // Ensure the user is authenticated
        if (isAuthenticated.value) {
            authResponseTemp.value.access_token = await getAccessTokenSilently();

            email.value = user.value?.email ?? '';
            const zohoInfo = await verifyEmail();
            console.log(zohoInfo);
            authResponseTemp.value.companyId = zohoInfo.CompanyId;
            authResponseTemp.value.companyName = zohoInfo.CompanyName;
            localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
            console.log(authResponseTemp);
            checkUserAndRedirect();
        } else {
            router.push("/login"); // Redirect to login if not authenticated
        }
    };

    const verifyEmail = async () => {
        loading.value = true;
        try {
            const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/checkEmail', {
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
            console.log(err);
            // error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const clientId = '86tqj0ugmm99kh'; // Replace with your LinkedIn App Client ID
    const redirectUri = 'http://localhost:3000/callback'; // Replace with your app's Redirect URI
    const scope = 'r_liteprofile r_emailaddress'; // Permissions you need

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
        const logintype = localStorage.getItem("loginType");
        if(logintype == "username-password") {
            const authStore = useAuthStore();
            isAuthenticated.value = authStore.isTokenValid();
        } else {
            authResponseTemp.value.access_token = await getAccessTokenSilently();
            email.value = user.value?.email ?? '';
            const zohoInfo = await verifyEmail();
            console.log(zohoInfo);
            if(zohoInfo != null) {
                authResponseTemp.value.companyId = zohoInfo.CompanyId;
                authResponseTemp.value.companyName = zohoInfo.CompanyName;
                localStorage.setItem('user', JSON.stringify(authResponseTemp.value));
                console.log(authResponseTemp);
                if (isAuthenticated.value) {
                    router.push("/dashboard");
                } else {
                    logout();
                    errorMessage.value = "Email not exist please contact you admin";
                    // router.push("/login"); // Redirect to login if not authenticated
                }
            } else {
                logout();
                errorMessage.value = "Email not exist please contact you admin";
            }
        }
    });

    function validatePassword() {
        const result = checkPasswordComplexity(password.value);
        errorMessage.value = result.message;
    }
</script>
  
<style scoped>
    .logo1 {
        width: 100%;  /* Adjust size as needed */
        max-width: 200px; /* Limit max width */
        margin-bottom: 16px; /* Add some space below the logo */
    }
    .error {
        color: red;
        text-align: center;
    }
</style>
  