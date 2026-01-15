<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuthenticationHandler from '../services/AuthenticationHandler'

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
        const user = AuthenticationHandler.getUser()
        currentUser.value = user?.email ?? null
    } catch (err: any) {
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
    margin: 2rem auto;
    padding: 2rem;
}

h1 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
}

.description {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
    text-align: center;
    line-height: 1.5;
}

.form-container {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-error {
    background-color: #ffe6e6;
    color: #c0392b;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    text-align: center;
}

.success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid #c3e6cb;
    text-align: center;
}

.success-message p {
    margin: 0.5rem 0;
    line-height: 1.6;
}

.user-email {
    font-weight: 600;
    font-size: 1.1rem;
    color: #155724;
}

.logout-link {
    color: #155724;
    font-weight: 500;
    text-decoration: underline;
}

.logout-link:hover {
    color: #0d3d16;
}

dl {
    margin: 0;
}

dt {
    margin-top: 1rem;
    font-weight: 500;
    color: #2c3e50;
}

dt:first-child {
    margin-top: 0;
}

dd {
    margin: 0.5rem 0 1rem 0;
}

input[type="email"],
input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

input[type="email"]:disabled,
input[type="password"]:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.submit-button {
    width: 100%;
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.85rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
    background-color: #2980b9;
}

.submit-button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

.divider {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
}

.divider span {
    padding: 0 1rem;
    color: #95a5a6;
    font-size: 0.85rem;
    text-transform: uppercase;
}

.links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
}

.link {
    color: #3498db;
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.link:hover {
    background-color: #f8f9fa;
    text-decoration: underline;
}

.link-primary {
    background-color: #f8f9fa;
    font-weight: 500;
    border: 1px solid #e9ecef;
}

.link-primary:hover {
    background-color: #e9ecef;
    text-decoration: none;
}
</style>
