<script setup lang="ts">

import {RouterLink} from "vue-router";
</script>

<template>
  <h1>About ArtCorrect</h1>
  <h3> <RouterLink to="/privacy" class="link">Privacy politics</RouterLink></h3>


</template>

<style scoped>
.link {
  font-family: var(--font-body);
  color: var(--color-accent);
  text-decoration: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.link:hover {
  background-color: var(--color-paper-dark);
  text-decoration: underline;
}
</style>