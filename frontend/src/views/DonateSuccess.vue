<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>

            <h1>Thank You!</h1>

            <p class="message">
                Your donation has been received successfully.
                We truly appreciate your support!
            </p>

            <p class="info">
                A confirmation email will be sent to you shortly.
            </p>

            <div class="actions">
                <RouterLink to="/" class="btn btn-primary">Return Home</RouterLink>
                <RouterLink to="/donate" class="btn btn-secondary">Donate Again</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.success-container {
    max-width: 500px;
    margin: var(--spacing-xl) auto;
    padding: var(--spacing-xl);
}

.success-card {
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-success);
    text-align: center;
}

.success-icon {
    color: var(--color-success);
    margin-bottom: var(--spacing-lg);
}

h1 {
    font-family: var(--font-display);
    color: var(--color-success);
    margin: 0 0 var(--spacing-md) 0;
    font-size: 2rem;
}

.message {
    font-family: var(--font-body);
    color: var(--color-ink);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
}

.info {
    font-family: var(--font-body);
    color: var(--color-ink-muted);
    font-size: 0.9rem;
    margin-bottom: var(--spacing-lg);
}

.actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.btn {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: all 0.2s ease;
    text-align: center;
}

.btn-primary {
    background-color: var(--color-success);
    color: var(--color-paper);
    border: 2px solid var(--color-success);
}

.btn-primary:hover {
    background-color: var(--color-ink);
    border-color: var(--color-ink);
}

.btn-secondary {
    background-color: transparent;
    color: var(--color-accent);
    border: 2px solid var(--color-accent);
}

.btn-secondary:hover {
    background-color: var(--color-accent);
    color: var(--color-paper);
}
</style>
