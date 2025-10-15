<template>
    <div class="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <!-- Loading Spinner -->
      <div v-if="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <div class="col-12 col-sm-8 col-md-4">
        <div class="card shadow-lg">
          <!-- Logo Section -->
          <div class="card-header text-center bg-white border-0">
            <img src="@/assets/logo.png" alt="Logo" class="logo1" />
          </div>
  
          <div class="card-body">
            <h2 class="text-center mb-4">Forgot Password</h2>
  
            <form @submit.prevent>
              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  v-model="email"
                  class="form-control"
                  id="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
  
              <!-- OTP -->
              <div v-if="!otpVerified" class="mb-3">
                <label for="otp" class="form-label fw-semibold">OTP</label>
                <input
                  type="text"
                  v-model="otp"
                  class="form-control"
                  id="otp"
                  placeholder="Enter OTP"
                  required
                />
              </div>
  
              <!-- Password -->
              <div v-if="!otpVerified" class="mb-3">
                <label for="password" class="form-label fw-semibold">New Password</label>
                <input
                type="password"
                v-model="password"
                class="form-control"
                id="password"
                placeholder="Enter new password"
                required
                pattern="passwordPattern"
                title="Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character."
              />
              </div>
              <div v-if="!otpVerified" class="mb-3">
                <label for="password" class="form-label fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  v-model="confirmpassword"
                  class="form-control"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  required
                  :pattern="passwordPattern"
                  :title="passwordTitle"
                />
              </div>
  
              <!-- Error Message -->
              <div v-if="confirmpassword && confirmpassword !== password" class="text-danger mt-1">
                Passwords do not match
              </div>
              <p v-if="errorMessage" class="text-danger text-center">{{ errorMessage }}</p>
              <p v-if="successMessage" class="text-success text-center">{{ successMessage }}</p>
  
              <!-- Buttons -->
              <div class="d-flex justify-content-center mt-4">
                <button
                  v-if="!emailVerified"
                  type="button"
                  class="btn btn-primary w-100"
                  @click="verifyEmail"
                >
                  Verify Email
                </button>
  
                <button
                  v-else-if="!otpVerified"
                  type="button"
                  class="btn btn-primary w-100"
                  @click="verifyOTP"
                >
                  Verify OTP & Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import router from '@/router';
  import { API_BASE_URL } from '@/api/config';
  
  const email = ref('');
  const password = ref('');
  const confirmpassword = ref('');
  const otp = ref('');
  const valid = ref(false);
  const emailVerified = ref(false);
  const otpVerified = ref(true);
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);
  const successMessage = ref<string | null>(null);
  const passwordPattern = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:;\"\'<>,.?/]).{8,}$'
  const passwordTitle = 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.'

  const rules = {
    required: (value: string) => !!value || 'Required.',
    email: (value: string) => {
      const pattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      return pattern.test(value) || 'Invalid e-mail.';
    },
  };
  
  const verifyEmail = async () => {
    if (email.value && rules.email(email.value) === true) {
      loading.value = true;
      try {
        const response = await axios.post(API_BASE_URL+'/Zoho/zoho/checkEmailForgotPassword', {
          email: email.value,
        });
        console.log(response);
        emailVerified.value = response.data.emailVerified;
        otpVerified.value = response.data.otpVerified;
        successMessage.value = response.data.message;
      } catch (err) {
        console.error(err);
        errorMessage.value = 'Email verification failed.';
      } finally {
        loading.value = false;
      }
    } else {
      alert('Please enter a valid email.');
    }
  };
  
  const verifyOTP = async () => {
    if (otp.value) {
      loading.value = true;
      try {
        if(password == confirmpassword) {
          const response = await axios.post(API_BASE_URL+'/Zoho/zoho/verifyOTPUpdatePassword', {
            email: email.value,
            otp: otp.value,
            password: password.value,
          });
          console.log(response);
          otpVerified.value = true;
          emailVerified.value = true;
          successMessage.value = response.data.message;
          // Redirect after success
          setTimeout(() => {
            router.push({ name: 'Login' });
          }, 1500);
        } else {
          errorMessage.value = "Password mismatch"
        }
      } catch (err) {
        console.error(err);
        errorMessage.value = 'OTP verification failed.';
      } finally {
        loading.value = false;
      }
    } else {
      errorMessage.value = 'Please enter the OTP.';
    }
  };
  </script>
  
  <style scoped>
  .logo1 {
    width: 100%;
    max-width: 180px;
    margin-bottom: 12px;
  }
  .spinner-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  </style>
  