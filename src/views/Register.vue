<template>
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <!-- Loading Spinner -->
      <div v-if="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <div class="card shadow p-4" style="max-width: 400px; width: 100%;">
        <!-- Logo Section -->
        <div class="text-center mb-3">
          <img src="@/assets/logo.png" alt="Logo" class="logo1 mb-2" />
        </div>
  
        <h4 class="text-center mb-4">Register</h4>
  
        <form @submit.prevent>
          <!-- Email Field -->
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              v-model="email"
              id="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': emailTouched && !rules.email(email) }"
              placeholder="Enter your email"
              required
              @blur="emailTouched = true"
            />
            <div class="invalid-feedback">Invalid email address.</div>
          </div>
  
          <!-- OTP Field -->
          <div v-if="emailVerified && !otpVerified" class="mb-3">
            <label for="otp" class="form-label">OTP</label>
            <input
              v-model="otp"
              id="otp"
              type="text"
              class="form-control"
              placeholder="Enter OTP"
              required
            />
          </div>
  
          <!-- Password Field -->
          <div v-if="emailVerified && otpVerified" class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              v-model="password"
              id="password"
              type="password"
              class="form-control"
              placeholder="Enter password"
              required
              @input="validatePassword"
            />
          </div>
  
          <!-- Confirm Password Field -->
          <div v-if="emailVerified && otpVerified" class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              v-model="confirmpassword"
              id="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Confirm password"
              required
              @input="validateConfirmPassword"
            />
          </div>
  
          <!-- Error Message -->
          <p v-if="errorMessage" class="text-danger text-center small mb-3">
            {{ errorMessage }}
          </p>
  
          <!-- Buttons -->
          <div class="d-flex justify-content-center">
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
              Verify OTP
            </button>
  
            <button
              v-else
              type="button"
              class="btn btn-primary w-100"
              @click="submit"
            >
              Register
            </button>
          </div>
        </form>
  
        <!-- Login link -->
        <div class="text-center mt-3">
          <a href="/" class="text-decoration-none">Login</a>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from "vue";
  import axios from "axios";
  import router from "@/router";
  import { checkPasswordComplexity, checkPasswordsMatch } from "@/plugins/passwordUtils";
  import { API_BASE_URL } from '@/api/config';
  
  const email = ref("");
  const password = ref("");
  const confirmpassword = ref("");
  const otp = ref("");
  const valid = ref(false);
  const emailVerified = ref(false);
  const otpVerified = ref(false);
  const loading = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);
  const emailTouched = ref(false);
  
  const rules = {
    required: (value: string) => !!value || "Required.",
    email: (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
  };
  
  const verifyEmail = async () => {
    loading.value = true;
    if (rules.email(email.value)) {
      try {
        const response = await axios.post(
          API_BASE_URL+"/Zoho/zoho/checkEmail",
          { email: email.value }
        );
        if (response.data.obj != "") {
          const obj = JSON.parse(response.data.obj);
          if (obj.Auth0Status) {
            errorMessage.value = "Email already registered";
          } else {
            emailVerified.value = response.data.emailVerified;
            otpVerified.value = response.data.otpVerified;
            errorMessage.value = response.data.message;
          }
        } else {
            emailVerified.value = response.data.emailVerified;
            otpVerified.value = response.data.otpVerified;
            errorMessage.value = response.data.message;
        }
      } catch (err) {
        console.log(err);
      } finally {
        loading.value = false;
      }
    } else {
      alert("Please enter a valid email.");
      loading.value = false;
    }
  };
  
  const verifyOTP = async () => {
    loading.value = true;
    if (otp.value) {
      try {
        const response = await axios.post(
          API_BASE_URL+"/Zoho/zoho/verifyOTP",
          {
            email: email.value,
            otp: otp.value,
            password: password.value,
          }
        );
        otpVerified.value = response.data.otpVerified;
        emailVerified.value = response.data.emailVerified;
        errorMessage.value = response.data.message;
      } catch (err) {
        console.log(err);
      } finally {
        loading.value = false;
      }
    } else {
      alert("Please enter your OTP.");
      loading.value = false;
    }
  };
  
  const submit = async () => {
    loading.value = true;
    if (password.value && confirmpassword.value) {
      try {
        const response = await axios.post(
          API_BASE_URL+"/Zoho/zoho/register",
          { email: email.value, password: password.value }
        );
        errorMessage.value = response.data.message;
        setTimeout(() => router.push({ name: "Login" }), 5000);
      } catch (err) {
        console.log(err);
      } finally {
        loading.value = false;
      }
    } else {
      alert("Please enter a valid password.");
      loading.value = false;
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
    width: 120px;
  }
  
  .spinner-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  