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
                <v-btn
                    class="text-none mb-4"
                    color="indigo-darken-3"
                    size="large"
                    variant="flat"
                    @click="submit">
                    Login
                </v-btn>
            </v-card-actions>
            <a href="/register" class="d-flex justify-center">Register</a><br>
            <button @click="loginWithGoogle">Login with Google</button>
            <button @click="loginWithMicrosoft">Login with Microsoft</button>
            <button v-if="isAuthenticated" @click="logoutUser">Logout</button>

    <div v-if="isAuthenticated">
      <p>Welcome, {{ user }}</p>
    </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';
    import authConfig from "../../auth_config.json";
    import router from '@/router';
    import { useAuthStore } from '@/stores/userStore';
    import { checkPasswordComplexity } from '@/plugins/passwordUtils';
    import { useAuth0 } from "@auth0/auth0-vue";

    const { loginWithRedirect, isAuthenticated, logout, user, getAccessTokenSilently } = useAuth0();
    const userData = ref<any>(null);
    const tokenValid = ref(false);

    const validateToken = async () => {
        try {
            // Get the access token
            const token = await getAccessTokenSilently();

            // Add logic to validate token, e.g., checking expiration (optional)
            if (token) {
            tokenValid.value = true;
            }
        } catch (error) {
            console.error("Error validating token:", error);
        }
    };

    // Function to check user and redirect
    const checkUserAndRedirect = () => {
        if (user.value?.sub && tokenValid.value) {
            router.push("/cases"); // Redirect to another screen
        } else {
            console.error("User not valid or token invalid.");
        }
    };

    // const authStore = useAuthStore();

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
            // Perform login action
            console.log('Email:', email.value);
            console.log('Password:', password.value);
            try {
                const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/login', {
                    email: email.value,
                    password: password.value
                });
                if(response.status == 200) {
                    // authStore.setAuthResponse(response.data);
                    errorMessage.value = "";
                    router.push({ name: 'cases' });
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
        loginWithRedirect({
            connection: "google-oauth2", // Specify Google as the connection
        });
        // Ensure the user is authenticated
        if (isAuthenticated.value) {
            // authStore.setAuthResponse(user);
            userData.value = user.value;
            await validateToken();
            checkUserAndRedirect();
        } else {
            router.push("/login"); // Redirect to login if not authenticated
        }
    };

    const loginWithMicrosoft = () => {
        loginWithRedirect({
            connection: "microsoft", // Specify Microsoft as the connection
        });
    };

    onMounted(async () => {
        await validateToken();
        // Ensure the user is authenticated
        if (isAuthenticated.value) {
            userData.value = user.value;
            await validateToken();
            checkUserAndRedirect();
        } else {
            router.push("/login"); // Redirect to login if not authenticated
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
  