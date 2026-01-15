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
    margin: 2rem auto;
    padding: 2rem;
}

h1 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.description {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.form-container {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-error {
    background-color: #ffe6e6;
    color: #c0392b;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.error-message {
    background-color: #ffe6e6;
    color: #c0392b;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
}

.error-message p {
    margin: 0.5rem 0;
    line-height: 1.6;
}

.success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #c3e6cb;
}

.success-message p {
    margin: 0.5rem 0;
    line-height: 1.6;
}

dl {
    margin: 0;
}

dt {
    margin-top: 1rem;
    font-weight: 500;
    color: #2c3e50;
}

dd {
    margin: 0.5rem 0 1rem 0;
}

input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
}

input[type="password"]:focus {
    outline: none;
    border-color: #3498db;
}

input[type="password"]:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.submit-button {
    width: 100%;
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
}

.submit-button:hover:not(:disabled) {
    background-color: #2980b9;
}

.submit-button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

.links {
    margin-top: 1.5rem;
    text-align: center;
}

.links a,
.back-link {
    color: #3498db;
    text-decoration: none;
}

.links a:hover,
.back-link:hover {
    text-decoration: underline;
}

.back-link {
    display: inline-block;
    margin-top: 1rem;
}
</style>
