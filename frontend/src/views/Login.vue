<script setup lang="ts">

// Form fields
import {onMounted, ref} from "vue";
import AuthenticationHandler from "../services/AuthenticationHandler.ts";
import {RouterLink} from "vue-router";

const formEmail = ref('')
const formPassword = ref('')
const formError = ref<string | null>(null)
const currentUser = ref<string | null>(null)

const userLogin = async () => {
  try {
    if (!formEmail.value.trim()) {
      formError.value = 'Email is required'
      return
    }
    if (!formPassword.value.trim()) {
      formError.value = 'Password is required'
      return
    }

    const loginResult = await AuthenticationHandler.login(formEmail.value, formPassword.value)
    console.log('Login.vue: loginResult', loginResult)
    currentUser.value = AuthenticationHandler.getUser().email
  } catch (err: any) {
    formError.value = err.response?.data?.error || 'Failed to login'
    console.error('Error login:', err)
  }
}

onMounted(() => {
  // console.log('AuthenticationHandler.getUser()', AuthenticationHandler.getUser())
  // if ( AuthenticationHandler.getUser() != null ) {
  //   console.log('AuthenticationHandler.getUser().email', AuthenticationHandler.getUser().email)
  // }
  // console.log('AuthenticationHandler.getAccessToken()', AuthenticationHandler.getAccessToken())
  const user = AuthenticationHandler.getUser()
  if (user != null) {
    currentUser.value = user.email
  }
  else {
    currentUser.value = null
  }
})

</script>

<template>
  <h1>Login</h1>

  <div v-if="currentUser">
    You already logged in.
    <div>{{currentUser.valueOf() }}</div>
    Go to <RouterLink to="/logout">Logout</RouterLink> page first.
  </div>

  <div v-else>
    <form @submit.prevent="userLogin" class="modal-body">
      <div v-if="formError" class="form-error">
        {{ formError }}
      </div>
      <dl>
        <dt><label for="email">Email</label></dt>
        <dd><input
            type="text"
            id="email"
            name="email"
            v-model="formEmail"
            placeholder="Enter email"
            required
        /></dd>

        <dt><label for="email">Password</label></dt>
        <dd><input
            type="password"
            name="password"
            id="password"
            v-model="formPassword"
            required
        /></dd>
        <dt></dt>
        <dd>
          <button type="submit" class="btn-primary">Login</button>
        </dd>
      </dl>
    </form>
    <p>OR</p>
    <p><RouterLink to="/password-reset-request">Forgot password?</RouterLink> </p>
    <p>OR</p>
    <p><RouterLink to="/register">Register</RouterLink> </p>
  </div>
</template>

<style scoped>

</style>