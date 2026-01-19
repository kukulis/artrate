<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="cancel-container">
        <div class="cancel-card">
            <div class="cancel-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>

            <h1>Payment Cancelled</h1>

            <p class="message">
                Your donation was not completed.
                No charges have been made.
            </p>

            <p class="info">
                If you experienced any issues or have questions,
                please feel free to contact us.
            </p>

            <div class="actions">
                <RouterLink to="/donate" class="btn btn-primary">Try Again</RouterLink>
                <RouterLink to="/" class="btn btn-secondary">Return Home</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cancel-container {
    max-width: 500px;
    margin: var(--spacing-xl) auto;
    padding: var(--spacing-xl);
}

.cancel-card {
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-sepia-light);
    text-align: center;
}

.cancel-icon {
    color: var(--color-sepia);
    margin-bottom: var(--spacing-lg);
}

h1 {
    font-family: var(--font-display);
    color: var(--color-ink);
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
    background-color: var(--color-accent);
    color: var(--color-paper);
    border: 2px solid var(--color-accent);
}

.btn-primary:hover {
    background-color: var(--color-accent-dark);
    border-color: var(--color-accent-dark);
}

.btn-secondary {
    background-color: transparent;
    color: var(--color-ink);
    border: 2px solid var(--color-sepia-light);
}

.btn-secondary:hover {
    background-color: var(--color-paper-dark);
}
</style>
