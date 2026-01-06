<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ArticleService, { Article } from '../services/ArticleService'

const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchArticles = async () => {
  loading.value = true
  error.value = null
  try {
    articles.value = await ArticleService.getAll()
  } catch (err) {
    error.value = 'Failed to load articles'
    console.error('Error fetching articles:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="articles">
    <div class="header">
      <h2>Articles</h2>
      <button @click="fetchArticles" class="btn-refresh" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading articles...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchArticles" class="btn">Try Again</button>
    </div>

    <div v-else-if="articles.length === 0" class="empty">
      <p>No articles found</p>
    </div>

    <div v-else class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <h3>{{ article.title }}</h3>
        <p class="article-meta">
          <span class="author-id">Author: {{ article.author_id }}</span>
          <span v-if="article.created_at" class="date">
            {{ new Date(article.created_at).toLocaleDateString() }}
          </span>
        </p>
        <p class="article-content">{{ article.content }}</p>
        <div class="article-id">ID: {{ article.id }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.articles {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
}

.btn-refresh {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-refresh:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-refresh:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 2rem;
  background-color: #ffe6e6;
  border-radius: 8px;
  color: #c0392b;
}

.error .btn {
  margin-top: 1rem;
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.error .btn:hover {
  background-color: #a93226;
}

.articles-list {
  display: grid;
  gap: 1.5rem;
}

.article-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.3s;
}

.article-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.article-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.author-id {
  font-weight: 500;
}

.date {
  color: #95a5a6;
}

.article-content {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-id {
  font-size: 0.8rem;
  color: #95a5a6;
  font-family: monospace;
}
</style>
