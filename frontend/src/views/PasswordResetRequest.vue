<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import apiClient from '../services/api'

const formEmail = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)
const successMessage = ref<string | null>(null)

const handleSubmit = async () => {
    // Clear previous messages
    formError.value = null
    successMessage.value = null

    // Validate email
    if (!formEmail.value.trim()) {
        formError.value = 'Email is required'

        return
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formEmail.value.trim())) {
        formError.value = 'Please enter a valid email address'

        return
    }

    loading.value = true

    try {
        const response = await apiClient.post('/auth/password-reset/request', {
            email: formEmail.value.trim(),
            captchaToken: 'TODO'  // CAPTCHA not enabled (RECAPTCHA_ENABLE=false)
        })

        successMessage.value = response.data.message
        formEmail.value = ''  // Clear form on success
    } catch (error: any) {
        if (error.response?.data?.error) {
            formError.value = error.response.data.error
        } else if (error.response?.data?.details) {
            // Handle Zod validation errors
            const details = error.response.data.details
            const emailError = details.find((d: any) => d.field === 'email')
            formError.value = emailError?.message || 'Password reset request failed'
        } else {
            formError.value = 'Failed to send password reset request. Please try again.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="password-reset-container">
        <h1>Password Reset</h1>

        <div v-if="successMessage" class="success-message">
            <p>{{ successMessage }}</p>
            <p>Please check your email inbox (and spam folder) for the password reset link.</p>
            <RouterLink to="/login" class="back-link">Back to Login</RouterLink>
        </div>

        <div v-else class="form-container">
            <p class="description">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form @submit.prevent="handleSubmit">
                <div v-if="formError" class="form-error">
                    {{ formError }}
                </div>

                <dl>
                    <dt><label for="email">Email</label></dt>
                    <dd>
                        <input
                            type="email"
                            id="email"
                            v-model="formEmail"
                            placeholder="Enter your email"
                            required
                            :disabled="loading"
                        />
                    </dd>
                    <dt></dt>
                    <dd>
                        <button type="submit" :disabled="loading" class="submit-button">
                            {{ loading ? 'Sending...' : 'Request Password Reset' }}
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

input[type="email"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
}

input[type="email"]:focus {
    outline: none;
    border-color: #3498db;
}

input[type="email"]:disabled {
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