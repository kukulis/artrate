<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const articleId = ref<string>(route.params.article_id as string)

onMounted(() => {
  console.log('Rankings for article:', articleId.value)
})
</script>

<template>
  <div class="rankings">
    <div class="header">
      <h2>Rankings for Article {{ articleId }}</h2>
    </div>

    <div class="content">
      <p>Rankings management will be implemented here.</p>
    </div>
  </div>
</template>

<style scoped>
.rankings {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.content {
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}
</style>
