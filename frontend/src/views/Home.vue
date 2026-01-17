<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '../services/api'

interface ApiResponse {
  message: string
  database?: string
  queryResult?: unknown
  error?: string
}

const backendStatus = ref<string>('Checking...')
const backendResponse = ref<ApiResponse | null>(null)

const checkBackend = async () => {
  try {
    const response = await apiClient.get<ApiResponse>('/test')
    backendResponse.value = response.data
    backendStatus.value = 'Connected ✓'
  } catch (error) {
    backendStatus.value = 'Failed ✗'
    console.error('Backend connection error:', error)
  }
}

onMounted(() => {
  checkBackend()
})
</script>

<template>
  <div class="home">
    <h2>Welcome to ArtCorrect</h2>
    <div class="status-card">
      <h3>Backend Status: {{ backendStatus }}</h3>
      <div v-if="backendResponse" class="response">
        <p><strong>Message:</strong> {{ backendResponse.message }}</p>
        <p v-if="backendResponse.database">
          <strong>Database:</strong> {{ backendResponse.database }}
        </p>
        <p v-if="backendResponse.error" class="error">
          <strong>Error:</strong> {{ backendResponse.error }}
        </p>
      </div>
      <button @click="checkBackend" class="btn">Refresh Status</button>
    </div>
  </div>
</template>

<style scoped>
.home {
    max-width: 800px;
    margin: 0 auto;
}

h2 {
    font-family: var(--font-display);
    color: var(--color-ink);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--color-sepia-light);
}

.status-card {
    background: var(--color-paper-light);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    margin-top: var(--spacing-xl);
    border: 1px solid var(--color-paper-dark);
    box-shadow: var(--shadow-sm);
}

.status-card h3 {
    font-family: var(--font-display);
    color: var(--color-ink);
    margin-bottom: var(--spacing-md);
}

.response {
    margin: var(--spacing-md) 0;
    padding: var(--spacing-md);
    background: var(--color-paper);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-paper-dark);
    font-family: var(--font-body);
}

.response p {
    margin: var(--spacing-sm) 0;
    color: var(--color-ink-light);
}

.error {
    color: var(--color-error);
}

.btn {
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

.btn:hover {
    background-color: var(--color-accent-dark);
    border-color: var(--color-accent-dark);
}
</style>
