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
              <h2 class="text-h5 text-center">Register</h2>
            </v-card-title>
  
            <v-card-text>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field v-model="email" label="Email" variant="outlined" :rules="[rules.required, rules.email]" required></v-text-field>
                <v-text-field v-if="emailVerified && !otpVerified" v-model="otp" label="OTP" variant="outlined" :rules="[rules.required]" type="text" required></v-text-field>
                <v-text-field v-if="emailVerified && otpVerified" v-model="password" label="Password" variant="outlined" :rules="[rules.required]" type="password" required></v-text-field>
                <v-text-field v-if="emailVerified && otpVerified" v-model="confirmpassword" label="Conform Password" variant="outlined" :rules="[rules.required]" type="password" required></v-text-field>
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

    const verifyEmail = async () => {
        // Simulate email verification
        if (valid.value && email.value) {
            try {
                const response = await axios.post('https://localhost:7222/Zoho/zoho/checkEmail', {
                    email: email.value
                });
                console.log(response);
                // error.value = '';
                emailVerified.value = response.data.emailVerified;
                otpVerified.value = response.data.otpVerified;
                errorMessage.value = response.data.message;
            } catch (err) {
                // error.value = err.message;
            } finally {
                // loading.value = false;
            }
        } else {
            alert('Please enter a valid email.');
        }
    };

    const verifyOTP = async () => {
        if (valid.value && otp.value) {
            try {
                const response = await axios.post('https://localhost:7222/Zoho/zoho/verifyOTP', {
                    email: email.value,
                    otp: otp.value,
                    password: password.value
                });    
                
                console.log(response);
                otpVerified.value = response.data.otpVerified;
                emailVerified.value = response.data.emailVerified;
            } catch (err) {
                // error.value = err.message;
            } finally {
                // loading.value = false;
            }
        } else {
            alert('Please enter your password.');
        }
    };

    const submit = async () => {
        if (valid.value && password.value) {
            // Perform login action
            console.log('Email:', email.value);
            console.log('Password:', password.value);
            try {
                var response = "";
                response = await axios.post('https://localhost:7222/Zoho/zoho/register', {
                    email: email.value,
                    password: password.value
                });
                console.log(response);
                otpVerified.value = true;
                emailVerified.value = true;
            } catch (err) {
                // error.value = err.message;
            } finally {
                // loading.value = false;
            }
            // try {
                // let data = JSON.stringify({
                //     "email": email.value,
                //     "phone_number": "string",
                //     "user_metadata": {},
                //     "blocked": false,
                //     "email_verified": false,
                //     "phone_verified": false,
                //     "app_metadata": {},
                //     "given_name": "string",
                //     "family_name": "string",
                //     "name": "string",
                //     "nickname": "string",
                //     "picture": "string",
                //     "user_id": "string",
                //     "connection": "string",
                //     "password": password.value,
                //     "verify_email": false,
                //     "username": "string"
                // });

                // let config = {
                // method: 'post',
                // maxBodyLength: Infinity,
                // url: 'https://login.auth0.com/api/v2/users',
                // headers: { 
                //     'Content-Type': 'application/json', 
                //     'Accept': 'application/json'
                // },
                // data : data
                // };

                // axios.request(config)
                // .then((response) => {
                // console.log(JSON.stringify(response.data));
                // })
                // .catch((error) => {
                // console.log(error);
                // });
                // Call Auth0 Authentication API with email and password
                // const response = await axios.post(
                //     'https://'+authConfig.domain+'/oauth/token',
                //     {
                //         grant_type: 'password',
                //         username: email.value,
                //         password: password.value,
                //         // audience: 'YOUR_API_IDENTIFIER',  // Optional, for API calls
                //         client_id: authConfig.clientId,
                //         client_secret: authConfig.clientSecret,  // Required if configured
                //         scope: 'openid profile email',
                //         connection: 'Username-Password-Authentication',
                //     }
                // );
                // console.log(response);
                // const { access_token } = response.data;

                // // Store the token and redirect user
                // localStorage.setItem('auth_token', access_token);

                // router.push('/cases');  // Redirect to profile after login
            // } catch (error) {
            //     alert('Login failed, please try again.');
            // }
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
  