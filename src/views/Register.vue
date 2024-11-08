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
              <h2 class="text-h5 text-center">Register</h2>
            </v-card-title>
  
            <v-card-text>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field v-model="email" label="Email" variant="outlined" :rules="[rules.required, rules.email]" required></v-text-field>
                <v-text-field v-if="emailVerified && !otpVerified" v-model="otp" label="OTP" variant="outlined" :rules="[rules.required]" type="text" required></v-text-field>
                <v-text-field v-if="emailVerified && otpVerified" v-model="password" label="Password" variant="outlined" :rules="[rules.required]" type="password" required @input="validatePassword"></v-text-field>
                <v-text-field v-if="emailVerified && otpVerified" v-model="confirmpassword" label="Conform Password" variant="outlined" :rules="[rules.required]" type="password" required @input="validateConfirmPassword"></v-text-field>
              </v-form>
            </v-card-text>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <v-card-actions class="d-flex justify-center">
                <v-btn
                    v-if="!emailVerified"
                    class="text-none mb-4"
                    color="indigo-darken-3"
                    size="large"
                    variant="flat"
                    @click="verifyEmail">
                    Verify Email
                </v-btn>
                <v-btn
                    v-else-if="!otpVerified"
                    class="text-none mb-4"
                    color="indigo-darken-3"
                    size="large"
                    variant="flat"
                    @click="verifyOTP">
                    Verify OTP
                </v-btn>
                <v-btn
                    v-else
                    class="text-none mb-4"
                    color="indigo-darken-3"
                    size="large"
                    variant="flat"
                    @click="submit">
                    Register
                </v-btn>
            </v-card-actions>
            <a href="/" class="d-flex justify-center">Login</a><br>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
</template>
  
<script lang="ts" setup>
    import { ref } from 'vue';
    import axios from 'axios';
    import authConfig from "../../auth_config.json";
    import router from '@/router';
    import { checkPasswordComplexity, checkPasswordsMatch } from '@/plugins/passwordUtils';
    
    const email = ref('');
    const password = ref('');
    const confirmpassword = ref('');
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

    const verifyEmail = async () => {
        loading.value = true;
        // Simulate email verification
        if (valid.value && email.value) {
            try {
                const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/checkEmail', {
                    email: email.value
                });
                if(response.data.obj != ""){
                    const obj = JSON.parse(response.data.obj);
                    console.log(obj);
                    if(obj.Auth0Status) {
                        errorMessage.value = "Email already registered";
                    } else {
                        emailVerified.value = response.data.emailVerified;
                        otpVerified.value = response.data.otpVerified;
                        errorMessage.value = response.data.message;
                    }
                } else {
                    errorMessage.value = response.data.message;
                }
            } catch (err) {
                console.log(err);
                // error.value = err.message;
            } finally {
                loading.value = false;
            }
        } else {
            alert('Please enter a valid email.');
        }
    };

    const verifyOTP = async () => {
        loading.value = true;
        if (valid.value && otp.value) {
            try {
                const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/verifyOTP', {
                    email: email.value,
                    otp: otp.value,
                    password: password.value
                });
                otpVerified.value = response.data.otpVerified;
                emailVerified.value = response.data.emailVerified;
                errorMessage.value = response.data.message;
            } catch (err) {
                console.log(err);
                // error.value = err.message;
            } finally {
                loading.value = false;
            }
        } else {
            alert('Please enter your password.');
            loading.value = false;
        }
    };

    const submit = async () => {
        loading.value = true;
        if (valid.value && password.value) {
            try {
                const response = await axios.post('https://zohodeliverablesapi.azurewebsites.net/Zoho/zoho/register', {
                    email: email.value,
                    password: password.value
                });
                console.log(response);
                otpVerified.value = true;
                emailVerified.value = true;
                errorMessage.value = response.data.message;
                setTimeout(() => {
                    router.push({ name: 'Login' });
                }, 5000);
            } catch (err) {
                console.log(err);
                // errorMessage.value = err.message;
            } finally {
                loading.value = false;
            }
        } else {
            loading.value = false;
            alert('Please enter your password.');
        }
    };

    function validatePassword() {
        const result = checkPasswordComplexity(password.value);
        errorMessage.value = result.message;
    }
    function validateConfirmPassword() {
        const result = checkPasswordsMatch(password.value, confirmpassword.value);
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
  