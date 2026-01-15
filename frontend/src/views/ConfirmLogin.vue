<script setup lang="ts">

import { onMounted, ref } from "vue";
import AuthenticationHandler from "../services/AuthenticationHandler.ts";
import type { ConfirmLoginResponse } from "../types/api";

const confirmError = ref<string | null>(null)
const confirmResult = ref<ConfirmLoginResponse | null>(null)

const confirmLogin = async () => {
    try {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (!token) {
            confirmError.value = 'No confirmation token provided'

            return
        }

        confirmResult.value = await AuthenticationHandler.confirmLogin(token)
    } catch (err: any) {
        confirmError.value = err.response?.data?.error || 'Failed to confirm'
        console.error('Confirm error:', err)
    }
}


onMounted(() => {
  confirmLogin()
})
</script>

<template>
    <h1>Confirm Login</h1>
    <div v-if="confirmError">
        Confirm error:
        {{ confirmError }}
    </div>
    <div v-if="confirmResult">
        {{ confirmResult.message }}
    </div>
</template>

<style scoped>

</style>