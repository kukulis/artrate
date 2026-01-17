<script setup lang="ts">

import AuthenticationHandler from "../services/AuthenticationHandler.ts";
import {onMounted, ref} from "vue";
import {RouterLink, useRouter} from "vue-router";

const router = useRouter()

const currentUser = ref<string | null>(null)

const userLogout = async () => {
    await AuthenticationHandler.logout()
    currentUser.value = null
    router.push('/')
}


onMounted(() => {
  const user = AuthenticationHandler.getUser()
  console.log('user:', user)
  if (user != null) {
    currentUser.value = user.email
  } else {
    currentUser.value = null
  }
  console.log('currentUser.value:', currentUser.value)
})
</script>

<template>
    <div class="logout-container">
        <div v-if="currentUser" class="form-container">
            <h1>Logout</h1>
            <p class="logout-message">You are logged in as <strong>{{ currentUser }}</strong></p>
            <form @submit.prevent="userLogout">
                <dl>
                    <dd>
                        <button type="submit">Logout</button>
                    </dd>
                </dl>
            </form>
        </div>
        <div v-else class="not-logged-in">
            <p>You are not logged in.</p>
            <RouterLink to="/login">Go to Login</RouterLink>
        </div>
    </div>
</template>

<style scoped>
.logout-container {
    max-width: 400px;
    margin: var(--spacing-xl) auto;
    padding: var(--spacing-xl);
}

h1 {
    font-family: var(--font-display);
    color: var(--color-ink);
    margin-bottom: var(--spacing-lg);
    text-align: center;
}

.form-container {
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-paper-dark);
    text-align: center;
}

.logout-message {
    font-family: var(--font-body);
    color: var(--color-ink-light);
    margin-bottom: var(--spacing-lg);
}

.logout-message strong {
    color: var(--color-ink);
    font-family: var(--font-display);
}

dl {
    margin: 0;
}

dd {
    margin: var(--spacing-md) 0 0 0;
}

button[type="submit"] {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-error);
    color: var(--color-paper);
    border: 2px solid var(--color-error);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

button[type="submit"]:hover {
    background-color: transparent;
    color: var(--color-error);
}

.not-logged-in {
    background: var(--color-info-bg);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-info);
    text-align: center;
    font-family: var(--font-body);
    color: var(--color-info);
}

.not-logged-in a {
    color: var(--color-accent);
    font-weight: 600;
    text-decoration: none;
}

.not-logged-in a:hover {
    text-decoration: underline;
}
</style>