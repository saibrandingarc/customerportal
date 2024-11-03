<template>
  <div class="nav-container mb-3">
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container">
        <div class="navbar-brand">
          <img class="mb-3 app-logo" src="/logo.png" alt="Vue.js logo" width="120">
        </div>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated">
              <router-link to="/cases" class="nav-link">Cases</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated">
              <router-link to="/deliverables" class="nav-link">Deliverables</router-link>
            </li>
          </ul>
          <ul class="navbar-nav d-none d-md-block">
            <li v-if="!isAuthenticated && !isLoading" class="nav-item">
              <router-link to="/login" class="nav-link">Login</router-link>
              <button
                id="qsLoginBtn"
                class="btn btn-primary btn-margin"
                @click.prevent="login"
              >Login</button>
            </li>

            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a id="qsLogoutBtn" href="#" class="dropdown-item" @click.prevent="logout">
                <font-awesome-icon class="mr-3" icon="power-off" />Log out
              </a>
            </li>
          </ul>

          <ul class="navbar-nav d-md-none" v-if="!isAuthenticated && !isLoading">
            <button id="qsLoginBtn" class="btn btn-primary btn-block" @click="login">Log in</button>
          </ul>

          <!-- <ul
            id="mobileAuthNavBar"
            class="navbar-nav d-md-none d-flex"
            v-if="isAuthenticated"
          >
            <li class="nav-item">
              <span class="user-info">
                <img
                  :src="user.value?.picture"
                  alt="User's profile picture"
                  class="nav-user-profile d-inline-block rounded-circle mr-3"
                  width="50"
                />
                <h6 class="d-inline-block">{{ user.value?.name }}</h6>
              </span>
            </li>
            <li>
              <font-awesome-icon icon="user" class="mr-3" />
              <router-link to="/profile">Profile</router-link>
            </li>

            <li>
              <font-awesome-icon icon="power-off" class="mr-3" />
              <a id="qsLogoutBtn" href="#" class @click.prevent="logout">Log out</a>
            </li>
          </ul> -->
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue';
import { ref, computed, watch, onMounted } from 'vue';
const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0();
const accessToken = localStorage.getItem('auth_token');

onMounted(() => {
    if (accessToken) {
      isAuthenticated.value = true;
    }
});

const login = () => {
  loginWithRedirect();
};

const logoutUser = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
};
</script>

<style>
#mobileAuthNavBar {
  min-height: 125px;
  justify-content: space-between;
}
</style>
