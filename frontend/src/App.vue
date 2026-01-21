<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import AuthenticationHandler from './services/AuthenticationHandler'
import type { UserResponse } from './types/api'

const route = useRoute()
const currentUser = ref<UserResponse | null>(null)

const isAdmin = computed(() => {
    return currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin'
})

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

const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})
</script>

<template>
    <div id="app">
        <header>
            <div class="header-top">
                <span class="date">{{ currentDate }}</span>
                <div class="user-info" v-if="currentUser">
                    <span class="welcome">Welcome, {{ currentUser.name }}</span>
                </div>
            </div>

            <div class="masthead">
                <div class="decorative-line"></div>
                <h1>ArtCorrect</h1>
                <p class="tagline">Excellence in Article Evaluation</p>
                <div class="decorative-line"></div>
            </div>

            <nav>
                <RouterLink to="/">Home</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink to="/articles">Articles</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink to="/authors">Authors</RouterLink>
                <template v-if="isAdmin">
                    <span class="nav-divider">|</span>
                    <RouterLink to="/users">Users</RouterLink>
                </template>
              <span class="nav-divider">|</span>
              <RouterLink to="/sponsorship">Sponsorship</RouterLink>
              <span class="nav-divider">|</span>
              <RouterLink to="/about">About</RouterLink>
              <span class="nav-divider">|</span>
                <RouterLink v-if="currentUser" to="/logout">Logout</RouterLink>
                <RouterLink v-else to="/login">Login</RouterLink>

            </nav>
        </header>

        <main>
            <RouterView />
        </main>

        <footer>
            <div class="footer-content">
                <div class="decorative-line short"></div>
                <p>ArtCorrect &mdash; Thoughtful Analysis Since 2024</p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
header {
    background-color: var(--color-paper-light);
    border-bottom: 3px double var(--color-sepia);
    padding: var(--spacing-md) var(--spacing-xl);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--color-ink-muted);
    font-style: italic;
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-paper-dark);
}

.date {
    font-family: var(--font-body);
}

.user-info {
    font-family: var(--font-body);
}

.welcome {
    color: var(--color-sepia-dark);
}

.masthead {
    text-align: center;
    padding: var(--spacing-lg) 0;
}

.masthead h1 {
    font-family: var(--font-display);
    font-size: 3.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ink);
    margin: var(--spacing-sm) 0;
}

.tagline {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-style: italic;
    color: var(--color-sepia);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: var(--spacing-xs);
}

.decorative-line {
    height: 2px;
    background: linear-gradient(
        to right,
        transparent,
        var(--color-sepia-light) 20%,
        var(--color-sepia) 50%,
        var(--color-sepia-light) 80%,
        transparent
    );
    margin: var(--spacing-sm) auto;
    max-width: 400px;
}

.decorative-line.short {
    max-width: 200px;
}

nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    border-top: 1px solid var(--color-paper-dark);
    margin-top: var(--spacing-md);
}

nav a {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-ink-light);
    text-decoration: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    transition: color 0.2s, border-bottom 0.2s;
    border-bottom: 2px solid transparent;
}

nav a:hover {
    color: var(--color-accent);
    text-decoration: none;
}

nav a.router-link-active {
    color: var(--color-accent);
    border-bottom: 2px solid var(--color-accent);
}

.nav-divider {
    color: var(--color-sepia-light);
    font-weight: 300;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl);
    min-height: calc(100vh - 300px);
}

footer {
    background-color: var(--color-paper-light);
    border-top: 1px solid var(--color-paper-dark);
    padding: var(--spacing-xl);
    margin-top: var(--spacing-2xl);
}

.footer-content {
    text-align: center;
}

.footer-content p {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    font-style: italic;
    margin-top: var(--spacing-md);
}
</style>
