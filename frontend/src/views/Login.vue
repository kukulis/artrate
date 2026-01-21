<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthenticationHandler from '../services/AuthenticationHandler'

const router = useRouter()

const formEmail = ref('')
const formPassword = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)
const currentUser = ref<string | null>(null)

const userLogin = async () => {
    formError.value = null

    if (!formEmail.value.trim()) {
        formError.value = 'Email is required'

        return
    }

    if (!formPassword.value.trim()) {
        formError.value = 'Password is required'

        return
    }

    loading.value = true

    try {
        await AuthenticationHandler.login(formEmail.value, formPassword.value)
        console.log('Login.vue: after AuthenticationHandler.login')
        router.push('/')
    } catch (err: any) {
        console.log('Login.vue: catch block after AuthenticationHandler.login')
        formError.value = err.response?.data?.error || 'Failed to login'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    const user = AuthenticationHandler.getUser()
    currentUser.value = user?.email ?? null
})
</script>

<template>
    <div class="login-container">
        <h1>Login</h1>

        <div v-if="currentUser" class="success-message">
            <p>You are logged in as:</p>
            <p class="user-email">{{ currentUser }}</p>
            <p>
                <RouterLink to="/logout" class="logout-link">Logout</RouterLink>
                to sign in with a different account.
            </p>
        </div>

        <div v-else class="form-container">
            <p class="description">
                Sign in to your account to continue.
            </p>

            <form @submit.prevent="userLogin">
                <div v-if="formError" class="form-error">
                    {{ formError }}
                </div>

                <dl>
                    <dt><label for="email">Email</label></dt>
                    <dd>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            v-model="formEmail"
                            placeholder="Enter your email"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt><label for="password">Password</label></dt>
                    <dd>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            v-model="formPassword"
                            placeholder="Enter your password"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt></dt>
                    <dd>
                        <button type="submit" :disabled="loading" class="submit-button">
                            {{ loading ? 'Signing in...' : 'Sign In' }}
                        </button>
                    </dd>
                </dl>
            </form>

            <div class="divider">
                <span>or</span>
            </div>

            <div class="links">
                <RouterLink to="/password-reset-request" class="link">Forgot password?</RouterLink>
                <RouterLink to="/register" class="link link-primary">Create an account</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
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

.description {
    font-family: var(--font-body);
    color: var(--color-ink-muted);
    margin-bottom: var(--spacing-lg);
    text-align: center;
    line-height: 1.5;
}

.form-container {
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-paper-dark);
}

.form-error {
    background-color: var(--color-error-bg);
    color: var(--color-error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-error);
    margin-bottom: var(--spacing-md);
    font-size: 0.9rem;
    text-align: center;
    font-family: var(--font-body);
}

.success-message {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-success);
    text-align: center;
}

.success-message p {
    margin: var(--spacing-sm) 0;
    line-height: 1.6;
    font-family: var(--font-body);
}

.user-email {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--color-success);
    font-family: var(--font-display);
}

.logout-link {
    color: var(--color-success);
    font-weight: 600;
    text-decoration: underline;
}

.logout-link:hover {
    color: var(--color-ink);
}

dl {
    margin: 0;
}

dt {
    margin-top: var(--spacing-md);
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink);
}

dt:first-child {
    margin-top: 0;
}

dd {
    margin: var(--spacing-sm) 0 var(--spacing-md) 0;
}

input[type="email"],
input[type="password"] {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-sepia-light);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-family: var(--font-body);
    background-color: var(--color-paper);
    color: var(--color-ink);
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

input[type="email"]:disabled,
input[type="password"]:disabled {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
    cursor: not-allowed;
}

.submit-button {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-accent);
    color: var(--color-paper);
    border: 2px solid var(--color-accent);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
    background-color: var(--color-accent-dark);
    border-color: var(--color-accent-dark);
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.divider {
    display: flex;
    align-items: center;
    margin: var(--spacing-lg) 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-paper-dark);
}

.divider span {
    padding: 0 var(--spacing-md);
    color: var(--color-sepia);
    font-size: 0.85rem;
    text-transform: uppercase;
    font-family: var(--font-body);
    letter-spacing: 0.05em;
}

.links {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
}

.link {
    font-family: var(--font-body);
    color: var(--color-accent);
    text-decoration: none;
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
}

.link:hover {
    background-color: var(--color-paper-dark);
    text-decoration: underline;
}

.link-primary {
    background-color: var(--color-paper-dark);
    font-weight: 600;
    border: 1px solid var(--color-sepia-light);
}

.link-primary:hover {
    background-color: var(--color-sepia-light);
    color: var(--color-paper);
    text-decoration: none;
}

/* Mobile Responsive Styles */
@media (max-width: 480px) {
    .login-container {
        margin: var(--spacing-md) auto;
        padding: var(--spacing-md);
    }

    .form-container {
        padding: var(--spacing-md);
    }

    h1 {
        font-size: 1.5rem;
    }
}
</style>
