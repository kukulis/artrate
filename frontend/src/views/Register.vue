<script setup lang="ts">

import {onMounted, ref} from "vue";
import AuthenticationHandler from "../services/AuthenticationHandler.ts";
import {RouterLink} from "vue-router";

const currentUser = ref<string | null>(null)
const formError = ref<string | null>(null)
const formEmail = ref('')
const formName = ref('')
const formPassword1 = ref('')
const formPassword2 = ref('')
const registeredUser = ref<any | null>(null)

const formPasswordError = ref<string>('')


const userRegister = async () => {
  try {
    if (!formEmail.value.trim()) {
      formError.value = "Email must be non empty"
      return
    }
    if (!formPassword1.value.trim()) {
      formError.value = "Password must be non empty"
      return
    }

    if (formPassword2.value.trim() != formPassword1.value.trim()) {
      formError.value = "Repeated Password must be the same"
      return
    }

    const registerResult = await AuthenticationHandler.register(
        formEmail.value.trim(),
        formName.value.trim(),
        formPassword1.value.trim()
    )

    console.log('Register result:', registerResult)

    registeredUser.value = registerResult

  } catch (err: any) {
    formError.value = err.response?.data?.error || 'Failed to login'
    const details = err.response?.data?.details || [];
    console.log('Register.vue[47]: Error Register details:', details)

    // extract errors for password
    const passwordMessages =  details.filter((detail)=> detail.field == 'password').map((detail) => detail.message )
    console.log('Register.vue[51]: passwordMessages:', passwordMessages)
    formPasswordError.value = passwordMessages.join('|')

    console.log('Register.vue[54]: formPasswordError.valueOf', formPasswordError.value)
  }
}


onMounted(() => {
  const user = AuthenticationHandler.getUser()
  if (user != null) {
    currentUser.value = user.email
  } else {
    currentUser.value = null
  }
})

</script>

<template>
  <h1>Register</h1>

  <div v-if="currentUser">
    You already logged in.
    <div>{{ currentUser.valueOf() }}</div>
    Go to
    <RouterLink to="/logout">Logout</RouterLink>
    page first.
  </div>

  <div v-else>

    <div v-if="registeredUser">
      <p>User registered {{ registeredUser.value.email }}</p>
      <p>The user created in a non-active mode. Check your email box to confirm email and activate your login</p>
      <p>in case you stuck with your registration, contact us by email -- TODO admin email -- </p>
    </div>
    <div v-else>
      <form @submit.prevent="userRegister" class="modal-body">
        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>
        <dl>
          <dt><label for="email">Email</label></dt>
          <dd><input type="text" name="email" id="email"
                     v-model="formEmail"
                     placeholder="Enter email"
                     required
          /></dd>
          <dt><label for="name">Name</label></dt>
          <dd><input
              type="text"
              name="name"
              id="name"
              v-model="formName"
              placeholder="Enter name"
          /></dd>
          <dt><label for="password1">Password</label></dt>
          <dd><input
              type="password"
              name="password1"
              id="password1"
              v-model="formPassword1"
              placeholder="Enter password"
          />
          <div v-if="formPasswordError" class="error">{{ formPasswordError }}</div>
          </dd>
          <dt><label for="password2">Password repeated</label></dt>
          <dd><input type="password"
                     name="password2"
                     id="password2"
                     v-model="formPassword2"
                     placeholder="Repeat password"
          /></dd>
          <dt></dt>
          <dd>
            <button type="submit">Register</button>
          </dd>
        </dl>
      </form>
    </div>
  </div>
</template>

<style scoped>
.error {
  text-align: center;
  padding: 2rem;
  background-color: #ffe6e6;
  border-radius: 8px;
  color: #c0392b;
}
</style>