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

.status-card {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.response {
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

.error {
  color: #c0392b;
}

.btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background-color: #2980b9;
}
</style>
