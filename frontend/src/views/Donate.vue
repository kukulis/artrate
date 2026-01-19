<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '../services/api'

interface DonationResponse {
    donation: {
        id: string
        order_id: string
        amount: number
        currency: string
        status: string
    }
    paymentUrl: string
}

const formEmail = ref('')
const formName = ref('')
const formMessage = ref('')
const selectedAmount = ref<number | null>(null)
const customAmount = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)

const predefinedAmounts = [500, 1000, 2000, 5000] // in cents

const selectAmount = (amount: number) => {
    selectedAmount.value = amount
    customAmount.value = ''
}

const getAmountInCents = (): number | null => {
    if (selectedAmount.value) {
        return selectedAmount.value
    }

    if (customAmount.value) {
        const euros = parseFloat(customAmount.value)
        if (!isNaN(euros) && euros >= 1) {
            return Math.round(euros * 100)
        }
    }

    return null
}

const formatAmount = (cents: number): string => {
    return (cents / 100).toFixed(2)
}

const submitDonation = async () => {
    formError.value = null

    const amount = getAmountInCents()
    if (!amount) {
        formError.value = 'Please select or enter a donation amount (minimum 1 EUR)'

        return
    }

    if (!formEmail.value.trim()) {
        formError.value = 'Email is required'

        return
    }

    loading.value = true

    try {
        const response = await apiClient.post<DonationResponse>('/donations', {
            email: formEmail.value.trim(),
            amount,
            name: formName.value.trim() || undefined,
            message: formMessage.value.trim() || undefined,
        })

        // Redirect to Paysera payment page
        window.location.href = response.data.paymentUrl
    } catch (err: any) {
        formError.value = err.response?.data?.error || 'Failed to create donation. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="donate-container">
        <h1>Support ArtCorrect</h1>

        <div class="form-container">
            <p class="description">
                Your donation helps us maintain and improve ArtCorrect.
                Every contribution makes a difference!
            </p>

            <form @submit.prevent="submitDonation">
                <div v-if="formError" class="form-error">
                    {{ formError }}
                </div>

                <dl>
                    <dt>Amount</dt>
                    <dd class="amount-section">
                        <div class="amount-buttons">
                            <button
                                v-for="amount in predefinedAmounts"
                                :key="amount"
                                type="button"
                                :class="['amount-button', { selected: selectedAmount === amount }]"
                                @click="selectAmount(amount)"
                                :disabled="loading"
                            >
                                {{ formatAmount(amount) }} EUR
                            </button>
                        </div>
                        <div class="custom-amount">
                            <label for="customAmount">or enter custom amount:</label>
                            <div class="custom-amount-input">
                                <input
                                    type="number"
                                    id="customAmount"
                                    v-model="customAmount"
                                    placeholder="0.00"
                                    min="1"
                                    step="0.01"
                                    :disabled="loading"
                                    @input="selectedAmount = null"
                                />
                                <span class="currency-label">EUR</span>
                            </div>
                        </div>
                    </dd>

                    <dt><label for="email">Email *</label></dt>
                    <dd>
                        <input
                            type="email"
                            id="email"
                            v-model="formEmail"
                            placeholder="Your email address"
                            required
                            :disabled="loading"
                        />
                    </dd>

                    <dt><label for="name">Name (optional)</label></dt>
                    <dd>
                        <input
                            type="text"
                            id="name"
                            v-model="formName"
                            placeholder="Your name"
                            :disabled="loading"
                        />
                    </dd>

                    <dt><label for="message">Message (optional)</label></dt>
                    <dd>
                        <textarea
                            id="message"
                            v-model="formMessage"
                            placeholder="Leave a message..."
                            rows="3"
                            :disabled="loading"
                        ></textarea>
                    </dd>

                    <dt></dt>
                    <dd>
                        <button type="submit" :disabled="loading" class="submit-button">
                            {{ loading ? 'Processing...' : 'Donate Now' }}
                        </button>
                    </dd>
                </dl>
            </form>

            <div class="payment-info">
                <p>You will be redirected to Paysera to complete your payment securely.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.donate-container {
    max-width: 500px;
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

.amount-section {
    margin-top: var(--spacing-sm);
}

.amount-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.amount-button {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    padding: var(--spacing-md);
    border: 2px solid var(--color-sepia-light);
    border-radius: var(--radius-sm);
    background-color: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    transition: all 0.2s ease;
}

.amount-button:hover:not(:disabled) {
    border-color: var(--color-accent);
    background-color: var(--color-paper-light);
}

.amount-button.selected {
    border-color: var(--color-accent);
    background-color: var(--color-accent);
    color: var(--color-paper);
}

.amount-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.custom-amount label {
    display: block;
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    margin-bottom: var(--spacing-xs);
}

.custom-amount-input {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.custom-amount-input input {
    flex: 1;
}

.currency-label {
    font-weight: 600;
    color: var(--color-ink);
}

input[type="email"],
input[type="text"],
input[type="number"],
textarea {
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
input[type="number"]:focus,
textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

input[type="email"]:disabled,
input[type="text"]:disabled,
input[type="number"]:disabled,
textarea:disabled {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
    cursor: not-allowed;
}

textarea {
    resize: vertical;
    min-height: 80px;
}

.submit-button {
    width: 100%;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-accent);
    color: var(--color-paper);
    border: 2px solid var(--color-accent);
    padding: var(--spacing-md) var(--spacing-lg);
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

.payment-info {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-paper-dark);
    text-align: center;
}

.payment-info p {
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    margin: 0;
}
</style>
