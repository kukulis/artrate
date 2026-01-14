<script setup lang="ts">

import {onMounted, ref} from "vue";
import AuthenticationHandler from "../services/AuthenticationHandler.ts";

const confirmError = ref<string | null>(null)
const confirmResult = ref<string | null>(null)

const confirmLogin = async ( ) =>  {
  try {
    const params = new URLSearchParams(window.location.search)
    // console.log('this.$route.query.location:', this.$route.query.location )

    const token = params.get('token')
    console.log('token:', token)

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
    Confirm result:
    {{ confirmResult }}
  </div>

</template>

<style scoped>

</style>