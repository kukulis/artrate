<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import apiClient from '../services/api'

const route = useRoute()

const token = ref<string | null>(null)
const password = ref('')
const passwordConfirm = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)
const successMessage = ref<string | null>(null)
const tokenError = ref<string | null>(null)

onMounted(() => {
    const queryToken = route.query.token
    if (typeof queryToken === 'string' && queryToken.trim()) {
        token.value = queryToken
    } else {
        tokenError.value = 'Invalid or missing password reset token. Please request a new password reset link.'
    }
})

const handleSubmit = async () => {
    formError.value = null
    successMessage.value = null

    if (!password.value) {
        formError.value = 'Password is required'

        return
    }

    if (password.value.length < 8) {
        formError.value = 'Password must be at least 8 characters long'

        return
    }

    if (!passwordConfirm.value) {
        formError.value = 'Please confirm your password'

        return
    }

    if (password.value !== passwordConfirm.value) {
        formError.value = 'Passwords do not match'

        return
    }

    loading.value = true

    try {
        const response = await apiClient.post('/auth/password-reset/confirm', {
            token: token.value,
            password: password.value
        })

        successMessage.value = response.data.message || 'Your password has been successfully reset.'
        password.value = ''
        passwordConfirm.value = ''
    } catch (error: any) {
        if (error.response?.data?.error) {
            formError.value = error.response.data.error
        } else if (error.response?.data?.details) {
            const details = error.response.data.details
            const passwordError = details.find((d: any) => d.field === 'password')
            formError.value = passwordError?.message || 'Password reset failed'
        } else {
            formError.value = 'Failed to reset password. The link may have expired.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="password-reset-container">
        <h1>Reset Your Password</h1>

        <div v-if="tokenError" class="error-message">
            <p>{{ tokenError }}</p>
            <RouterLink to="/password-reset-request" class="back-link">Request New Reset Link</RouterLink>
        </div>

        <div v-else-if="successMessage" class="success-message">
            <p>{{ successMessage }}</p>
            <p>You can now log in with your new password.</p>
            <RouterLink to="/login" class="back-link">Go to Login</RouterLink>
        </div>

        <div v-else class="form-container">
            <p class="description">
                Enter your new password below.
            </p>

            <form @submit.prevent="handleSubmit">
                <div v-if="formError" class="form-error">
                    {{ formError }}
                </div>

                <dl>
                    <dt><label for="password">New Password</label></dt>
                    <dd>
                        <input
                            type="password"
                            id="password"
                            v-model="password"
                            placeholder="Enter new password"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt><label for="passwordConfirm">Confirm Password</label></dt>
                    <dd>
                        <input
                            type="password"
                            id="passwordConfirm"
                            v-model="passwordConfirm"
                            placeholder="Repeat new password"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt></dt>
                    <dd>
                        <button type="submit" :disabled="loading" class="submit-button">
                            {{ loading ? 'Resetting...' : 'Reset Password' }}
                        </button>
                    </dd>
                </dl>
            </form>

            <div class="links">
                <RouterLink to="/login">Back to Login</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.password-reset-container {
    max-width: 400px;
    margin: var(--spacing-xl) auto;
    padding: var(--spacing-xl);
}

h1 {
    font-family: var(--font-display);
    color: var(--color-ink);
    margin-bottom: var(--spacing-md);
    text-align: center;
}

.description {
    font-family: var(--font-body);
    color: var(--color-ink-muted);
    margin-bottom: var(--spacing-lg);
    line-height: 1.5;
    text-align: center;
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
    font-family: var(--font-body);
}

.error-message {
    background-color: var(--color-error-bg);
    color: var(--color-error);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-error);
}

.error-message p {
    margin: var(--spacing-sm) 0;
    line-height: 1.6;
    font-family: var(--font-body);
}

.success-message {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-success);
}

.success-message p {
    margin: var(--spacing-sm) 0;
    line-height: 1.6;
    font-family: var(--font-body);
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

dd {
    margin: var(--spacing-sm) 0 var(--spacing-md) 0;
}

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

input[type="password"]:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

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

.links {
    margin-top: var(--spacing-lg);
    text-align: center;
}

.links a,
.back-link {
    font-family: var(--font-body);
    color: var(--color-accent);
    text-decoration: none;
}

.links a:hover,
.back-link:hover {
    text-decoration: underline;
    color: var(--color-accent-dark);
}

.back-link {
    display: inline-block;
    margin-top: var(--spacing-md);
}
</style>
