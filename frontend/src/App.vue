<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import AuthenticationHandler from './services/AuthenticationHandler'
import type { UserResponse } from './types/api'

const route = useRoute()
const currentUser = ref<UserResponse | null>(null)

const checkAuthState = () => {
    currentUser.value = AuthenticationHandler.getUser()
}

onMounted(() => {
    checkAuthState()
})

// Re-check auth state on route changes (e.g., after login/logout)
watch(() => route.path, () => {
    checkAuthState()
})
</script>

<template>
  <div id="app">
    <header>
      <h1>ArtCorrect</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/articles">Articles</RouterLink>
        <RouterLink to="/authors">Authors</RouterLink>
        <RouterLink v-if="currentUser" to="/logout">Logout ({{ currentUser.name }})</RouterLink>
        <RouterLink v-else to="/login">Login</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
}

nav {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: #34495e;
}

nav a.router-link-active {
  background-color: #3498db;
}

main {
  padding: 2rem;
}
</style>
