<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuthenticationHandler from '../services/AuthenticationHandler'

interface ValidationDetail {
    field: string
    message: string
}

const currentUser = ref<string | null>(null)
const formError = ref<string | null>(null)
const formEmail = ref('')
const formName = ref('')
const formPassword1 = ref('')
const formPassword2 = ref('')
const registeredUser = ref<string | null>(null)
const loading = ref(false)

const formPasswordError = ref<string | null>(null)
const formEmailError = ref<string | null>(null)
const formNameError = ref<string | null>(null)

const clearFieldErrors = () => {
    formNameError.value = null
    formEmailError.value = null
    formPasswordError.value = null
    formError.value = null
}

const userRegister = async () => {
    clearFieldErrors()

    if (!formEmail.value.trim()) {
        formError.value = 'Email is required'

        return
    }

    if (!formName.value.trim()) {
        formError.value = 'Name is required'

        return
    }

    if (!formPassword1.value.trim()) {
        formError.value = 'Password is required'

        return
    }

    if (formPassword1.value.length < 8) {
        formError.value = 'Password must be at least 8 characters long'

        return
    }

    if (formPassword2.value !== formPassword1.value) {
        formError.value = 'Passwords do not match'

        return
    }

    loading.value = true

    try {
        const registerResult = await AuthenticationHandler.register(
            formEmail.value.trim(),
            formName.value.trim(),
            formPassword1.value,
            'TODO'
        )

        registeredUser.value = registerResult.user?.email ?? formEmail.value
    } catch (err: any) {
        formError.value = err.response?.data?.error || 'Registration failed'
        const details: ValidationDetail[] = err.response?.data?.details || []

        const passwordMessages = details
            .filter((detail) => detail.field === 'password')
            .map((detail) => detail.message)
        if (passwordMessages.length > 0) {
            formPasswordError.value = passwordMessages.join(' ')
        }

        const emailMessages = details
            .filter((detail) => detail.field === 'email')
            .map((detail) => detail.message)
        if (emailMessages.length > 0) {
            formEmailError.value = emailMessages.join(' ')
        }

        const nameMessages = details
            .filter((detail) => detail.field === 'name')
            .map((detail) => detail.message)
        if (nameMessages.length > 0) {
            formNameError.value = nameMessages.join(' ')
        }
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
    <div class="register-container">
        <h1>Create Account</h1>

        <div v-if="currentUser" class="info-message">
            <p>You are already logged in as:</p>
            <p class="user-email">{{ currentUser }}</p>
            <p>
                <RouterLink to="/logout" class="logout-link">Logout</RouterLink>
                to register a new account.
            </p>
        </div>

        <div v-else-if="registeredUser" class="success-message">
            <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h2>Registration Successful</h2>
            <p>Account created for <strong>{{ registeredUser }}</strong></p>
            <p class="info-text">
                Your account has been created but is not yet active.
                Please check your email inbox to confirm your email address and activate your account.
            </p>
            <p class="help-text">
                If you don't receive the email within a few minutes, please check your spam folder.
            </p>
            <div class="success-links">
                <RouterLink to="/login" class="link-button">Go to Login</RouterLink>
            </div>
        </div>

        <div v-else class="form-container">
            <p class="description">
                Create a new account to get started.
            </p>

            <form @submit.prevent="userRegister">
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
                            :class="{ 'input-error': formEmailError }"
                        />
                        <div v-if="formEmailError" class="field-error">{{ formEmailError }}</div>
                    </dd>

                    <dt><label for="name">Name</label></dt>
                    <dd>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            v-model="formName"
                            placeholder="Enter your full name"
                            required
                            :disabled="loading"
                            :class="{ 'input-error': formNameError }"
                        />
                        <div v-if="formNameError" class="field-error">{{ formNameError }}</div>
                    </dd>

                    <dt><label for="password1">Password</label></dt>
                    <dd>
                        <input
                            type="password"
                            id="password1"
                            name="password1"
                            v-model="formPassword1"
                            placeholder="Create a password"
                            required
                            :disabled="loading"
                            :class="{ 'input-error': formPasswordError }"
                        />
                        <div v-if="formPasswordError" class="field-error">{{ formPasswordError }}</div>
                        <div v-else class="field-hint">Must be at least 8 characters</div>
                    </dd>

                    <dt><label for="password2">Confirm Password</label></dt>
                    <dd>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            v-model="formPassword2"
                            placeholder="Repeat your password"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt></dt>
                    <dd>
                        <button type="submit" :disabled="loading" class="submit-button">
                            {{ loading ? 'Creating Account...' : 'Create Account' }}
                        </button>
                    </dd>
                </dl>
            </form>

            <div class="divider">
                <span>or</span>
            </div>

            <div class="links">
                <p class="login-prompt">Already have an account?</p>
                <RouterLink to="/login" class="link link-primary">Sign In</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    max-width: 420px;
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

.info-message {
    background-color: #e3f2fd;
    color: #1565c0;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid #bbdefb;
    text-align: center;
}

.info-message p {
    margin: 0.5rem 0;
    line-height: 1.6;
}

.success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid #c3e6cb;
    text-align: center;
}

.success-icon {
    color: #28a745;
    margin-bottom: 1rem;
}

.success-message h2 {
    color: #155724;
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
}

.success-message p {
    margin: 0.5rem 0;
    line-height: 1.6;
}

.info-text {
    margin-top: 1rem !important;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
}

.help-text {
    font-size: 0.85rem;
    color: #3d6b47;
}

.success-links {
    margin-top: 1.5rem;
}

.link-button {
    display: inline-block;
    background-color: #155724;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
}

.link-button:hover {
    background-color: #0d3d16;
}

.user-email {
    font-weight: 600;
    font-size: 1.1rem;
}

.logout-link {
    color: #1565c0;
    font-weight: 500;
    text-decoration: underline;
}

.logout-link:hover {
    color: #0d47a1;
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
    margin: 0.5rem 0 0.75rem 0;
}

input[type="email"],
input[type="text"],
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
input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

input[type="email"]:disabled,
input[type="text"]:disabled,
input[type="password"]:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.input-error {
    border-color: #c0392b !important;
}

.input-error:focus {
    box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1) !important;
}

.field-error {
    color: #c0392b;
    font-size: 0.85rem;
    margin-top: 0.35rem;
}

.field-hint {
    color: #95a5a6;
    font-size: 0.8rem;
    margin-top: 0.35rem;
}

.submit-button {
    width: 100%;
    background-color: #27ae60;
    color: white;
    border: none;
    padding: 0.85rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
    background-color: #219a52;
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
    text-align: center;
}

.login-prompt {
    color: #7f8c8d;
    margin-bottom: 0.75rem;
}

.link {
    color: #3498db;
    text-decoration: none;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
    display: inline-block;
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
