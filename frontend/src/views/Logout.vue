<script setup lang="ts">

import AuthenticationHandler from "../services/AuthenticationHandler.ts";
import {onMounted, ref} from "vue";
import {RouterLink} from "vue-router";

const currentUser = ref<string | null>(null)

const userLogout = async () => {
  await AuthenticationHandler.logout();

  currentUser.value = null;
}


onMounted(() => {
  const user = AuthenticationHandler.getUser()
  console.log('user:', user)
  if (user != null) {
    currentUser.value = user.email
  } else {
    currentUser.value = null
  }
  console.log('currentUser.value:', currentUser.value)
})
</script>

<template>
  <div v-if="currentUser">
    <h1>Logout {{ currentUser.valueOf() }}</h1>
    <form @submit.prevent="userLogout" class="modal-body">
      <dl>
        <dd>
          <button type="submit">Logout</button>
        </dd>
      </dl>
    </form>
  </div>
  <div v-else>
    You are not logged in.
    <RouterLink to="/login">Login</RouterLink>
  </div>
</template>

<style scoped>

</style>