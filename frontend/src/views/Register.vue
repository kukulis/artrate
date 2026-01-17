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

.info-message {
    background-color: var(--color-info-bg);
    color: var(--color-info);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-info);
    text-align: center;
}

.info-message p {
    margin: var(--spacing-sm) 0;
    line-height: 1.6;
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

.success-icon {
    color: var(--color-success);
    margin-bottom: var(--spacing-md);
}

.success-message h2 {
    font-family: var(--font-display);
    color: var(--color-success);
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.4rem;
}

.success-message p {
    margin: var(--spacing-sm) 0;
    line-height: 1.6;
    font-family: var(--font-body);
}

.info-text {
    margin-top: var(--spacing-md) !important;
    padding: var(--spacing-md);
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-md);
}

.help-text {
    font-size: 0.85rem;
    color: var(--color-success);
}

.success-links {
    margin-top: var(--spacing-lg);
}

.link-button {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-success);
    color: var(--color-paper);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: all 0.2s ease;
}

.link-button:hover {
    background-color: var(--color-ink);
    color: var(--color-paper);
}

.user-email {
    font-weight: 700;
    font-size: 1.1rem;
    font-family: var(--font-display);
}

.logout-link {
    color: var(--color-info);
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
input[type="text"],
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
input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

input[type="email"]:disabled,
input[type="text"]:disabled,
input[type="password"]:disabled {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
    cursor: not-allowed;
}

.input-error {
    border-color: var(--color-error) !important;
}

.input-error:focus {
    box-shadow: 0 0 0 3px rgba(139, 58, 58, 0.1) !important;
}

.field-error {
    color: var(--color-error);
    font-size: 0.85rem;
    margin-top: var(--spacing-xs);
    font-family: var(--font-body);
}

.field-hint {
    color: var(--color-sepia);
    font-size: 0.8rem;
    margin-top: var(--spacing-xs);
    font-family: var(--font-body);
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
    margin-top: var(--spacing-sm);
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
    text-align: center;
}

.login-prompt {
    font-family: var(--font-body);
    color: var(--color-ink-muted);
    margin-bottom: var(--spacing-md);
}

.link {
    font-family: var(--font-body);
    color: var(--color-accent);
    text-decoration: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
    display: inline-block;
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
</style>
