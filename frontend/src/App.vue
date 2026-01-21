<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import AuthenticationHandler from './services/AuthenticationHandler'
import type { UserResponse } from './types/api'

const route = useRoute()
const currentUser = ref<UserResponse | null>(null)
const mobileMenuOpen = ref(false)

const isAdmin = computed(() => {
    return currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin'
})

const checkAuthState = () => {
    currentUser.value = AuthenticationHandler.getUser()
}

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}

onMounted(() => {
    checkAuthState()
})

// Re-check auth state on route changes (e.g., after login/logout)
watch(() => route.path, () => {
    checkAuthState()
    closeMobileMenu()
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

            <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
                <span class="hamburger" :class="{ open: mobileMenuOpen }"></span>
            </button>

            <nav :class="{ 'nav-open': mobileMenuOpen }">
                <RouterLink to="/" @click="closeMobileMenu">Home</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink to="/articles" @click="closeMobileMenu">Articles</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink to="/authors" @click="closeMobileMenu">Authors</RouterLink>
                <template v-if="isAdmin">
                    <span class="nav-divider">|</span>
                    <RouterLink to="/users" @click="closeMobileMenu">Users</RouterLink>
                </template>
                <span class="nav-divider">|</span>
                <RouterLink to="/sponsorship" @click="closeMobileMenu">Sponsorship</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink to="/about" @click="closeMobileMenu">About</RouterLink>
                <span class="nav-divider">|</span>
                <RouterLink v-if="currentUser" to="/logout" @click="closeMobileMenu">Logout</RouterLink>
                <RouterLink v-else to="/login" @click="closeMobileMenu">Login</RouterLink>
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

/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    padding: var(--spacing-sm);
    cursor: pointer;
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
}

.hamburger {
    display: block;
    width: 24px;
    height: 2px;
    background-color: var(--color-ink);
    position: relative;
    transition: background-color 0.2s;
}

.hamburger::before,
.hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background-color: var(--color-ink);
    transition: transform 0.2s;
}

.hamburger::before {
    top: -7px;
}

.hamburger::after {
    top: 7px;
}

.hamburger.open {
    background-color: transparent;
}

.hamburger.open::before {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.open::after {
    transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    header {
        padding: var(--spacing-sm) var(--spacing-md);
        position: relative;
    }

    .header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }

    .masthead {
        padding: var(--spacing-sm) 0;
    }

    .masthead h1 {
        font-size: 2rem;
        letter-spacing: 0.05em;
    }

    .tagline {
        font-size: 0.7rem;
        letter-spacing: 0.1em;
    }

    .decorative-line {
        max-width: 200px;
    }

    .mobile-menu-btn {
        display: block;
    }

    nav {
        display: none;
        flex-direction: column;
        gap: 0;
        padding: 0;
        margin-top: var(--spacing-sm);
        border-top: 1px solid var(--color-paper-dark);
    }

    nav.nav-open {
        display: flex;
    }

    nav a {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--color-paper-dark);
        text-align: center;
    }

    nav a:last-child {
        border-bottom: none;
    }

    .nav-divider {
        display: none;
    }

    main {
        padding: var(--spacing-md);
    }

    footer {
        padding: var(--spacing-lg) var(--spacing-md);
    }
}

@media (max-width: 480px) {
    .masthead h1 {
        font-size: 1.5rem;
    }

    .tagline {
        font-size: 0.6rem;
    }

    .header-top .date {
        font-size: 0.7rem;
    }

    .welcome {
        font-size: 0.7rem;
    }
}
</style>
