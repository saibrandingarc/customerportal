<template>
    <v-container fluid fill-height>
        <!-- Loading Spinner -->
        <div v-if="loading" class="spinner-overlay">
            <div class="spinner"></div>
        </div>
        <section class="h-100 gradient-form">
            <div class="container py-5 h-100">
                <div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col-xl-8">
                        <div class="card shadow rounded-3 text-black">
                            <div class="row g-0">
                                <div class="col-lg-6">
                                    <div class="card-body p-md-5 mx-md-4">
                                        <div class="text-center">
                                            <img src="@/assets/logo.png" alt="Logo" class="logo1" />
                                            <h4 class="mt-1 mb-5 pb-1">Please login to your account</h4>
                                        </div>
                                        <form>
                                            <v-form ref="form" v-model="valid" lazy-validation>
                                                <v-text-field v-model="email" label="Email" variant="outlined" :rules="[rules.required, rules.email]" required></v-text-field>
                                                <v-text-field v-model="password" label="Password" variant="outlined" :rules="[rules.required]" type="password" required></v-text-field>
                                            </v-form>
                                            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
                                            <div class="text-center pt-1 mb-5 pb-1">
                                                <v-btn class="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" color="#198fd9" size="large" variant="flat" @click="submit">Login</v-btn>
                                                <a class="text-muted" href="/forgot_password">Forgot Password?</a><br>
                                            </div>
                                            <div class="d-flex align-items-center justify-content-center pb-4">
                                                <p class="mb-0 me-2">Don't have an account?</p>
                                                <a href="/register" class="d-flex justify-center btn btn-outline-danger">Register</a>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="card-footer" style="background-color: #FFF; border-top: none">
                                        <div class="text-center">
                                            <a class="me-4" href="/enduser" target="_blank" rel="noopener noreferrer"> End-user license agreement</a>
                                            <a class="me-4" href="https://brandingarc.com/privacy-policy/" target="_blank" rel="noopener noreferrer"> Privacy Policy</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6 d-flex align-items-center gradient-custom-2 justify-content-center">
                                    <div class="text-dark px-3 py-4 p-md-5 mx-md-4">
                                        <h4 class="d-flex justify-center mx-6">login via</h4>
                                        <div class="social-login d-flex justify-center">
                                            
                                            <v-btn class="google ma-2" color="#ea4335" icon="mdi-google" @click="loginWithGoogle"></v-btn>
                                            <v-btn class="ma-2" color="#0077B5" icon="mdi-linkedin" @click="loginWithLinkedIn"></v-btn>
                                            <!-- <v-btn class="ma-2" color="#EEEEEE" icon="mdi-microsoft"></v-btn> -->
                                        </div>
                                        <!-- <v-card-footer class="d-flex justify-center">
                                            <v-btn class="text-none mb-4 mr-2" color="indigo-darken-3" size="default" variant="flat" @click="loginWithMicrosoft">Microsoft Sign In</v-btn>
                                            <v-btn class="text-none mb-4" color="indigo-darken-3" size="default" variant="flat" @click="loginWithAzure">Microsoft Azure Sign In</v-btn>
                                        </v-card-footer> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </v-container>
</template>
  
<script lang="ts" setup>
    import { ref, onMounted, Ref, computed, watch } from 'vue';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
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

    .gradient-custom-2 {
        /* fallback for old browsers */
        background: #F8F8F8;
        /* background: #fccb90; */

        /* Chrome 10-25, Safari 5.1-6 */
        /* background: -webkit-linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593); */

        /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        /* background: linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593); */
    }

    @media (max-width: 1280px) {
        .h4, h4 {
            font-size: 1rem;
        }
        .mr-md-4, .mx-md-4 {
            margin-right: 1rem !important;
        }
    }

    @media (min-width: 1280px) {
        .h4, h4 {
            font-size: 1rem;
        }
        .mr-md-4, .mx-md-4 {
            margin-right: 1rem !important;
        }
        .p-md-5 {
            padding: 3rem 1rem!important
        }
    }

    @media (min-width: 1680px) {
        .h4, h4 {
            font-size: 1rem;
        }
        .mr-md-4, .mx-md-4 {
            margin-right: 1rem !important;
        }
        .p-md-5 {
            padding: 3rem !important
        }
    }

    @media (min-width: 768px) {
        .gradient-form {
            height: 100vh !important;
        }
    }
    @media (min-width: 769px) {
        .gradient-custom-2 {
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
        }
    }
    .social-login a {
        text-decoration: none;
        position: relative;
        text-align: center;
        color: #fff;
        margin-bottom: 10px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: inline-block;
    }
</style>
  