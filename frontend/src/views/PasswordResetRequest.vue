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

input[type="email"] {
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

input[type="email"]:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

input[type="email"]:disabled {
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