<template>
    <v-container fluid fill-height>
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
            </v-card-text>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
            <a href="/register" class="v-btn v-btn--primary">Register</a><br>
            <a href="/forgot_password" class="v-btn v-btn--primary">Forgot Password?</a>
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
    import { useAuthStore } from '@/stores/userStore';

    const authStore = useAuthStore();
    
    const email = ref('');
    const password = ref('');
    const otp = ref('');
    const valid = ref(false);
    const emailVerified = ref(false);
    const otpVerified = ref(true);

    const errorMessage = ref<string | null>(null);

    const rules = {
        required: (value: string) => !!value || 'Required.',
        email: (value: string) => {
            const pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            return pattern.test(value) || 'Invalid e-mail.';
        },
    };

    
    const submit = async () => {
        if (valid.value && password.value) {
            // Perform login action
            console.log('Email:', email.value);
            console.log('Password:', password.value);
            try {
                const response = await axios.post('https://localhost:7222/Zoho/zoho/login', {
                    email: email.value,
                    password: password.value
                });
                if(response.status == 200) {
                    authStore.setAuthResponse(response.data);
                    console.log(response);
                    router.push({ name: 'cases' });
                } else {
                    console.log("failed");
                }
            } catch (err) {
                // error.value = err.message;
            } finally {
                // loading.value = false;
            }
        } else {
            alert('Please enter your password.');
        }
    };
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
  