<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ArticleService from '../services/ArticleService'
import AuthorService from '../services/AuthorService'
import type { Article } from '../types/article'
import type { Author } from '../types/author'
import { formatDate } from '../utils/dateFormat'

const articles = ref<Article[]>([])
const authors = ref<Author[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingArticle = ref<Article | null>(null)

// Form fields
const formTitle = ref('')
const formAuthorId = ref('')
const formUserId = ref('')
const formContent = ref('')
const formError = ref<string | null>(null)
const formLoading = ref(false)

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

const fetchAuthors = async () => {
  try {
    authors.value = await AuthorService.getAll()
  } catch (err) {
    console.error('Error fetching authors:', err)
  }
}

const openCreateForm = () => {


  editingArticle.value = null
  formTitle.value = ''
  formAuthorId.value = ''
  formContent.value = ''
  formError.value = null
  showForm.value = true
  formUserId.value = ''
}

const openEditForm = (article: Article) => {
  editingArticle.value = article
  formTitle.value = article.title
  formAuthorId.value = article.author_id
  formContent.value = article.content
  formError.value = null
  formUserId.value = String(article.user_id)
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingArticle.value = null
  formTitle.value = ''
  formAuthorId.value = ''
  formContent.value = ''
  formError.value = null
}

const saveArticle = async () => {
  // Validation
  if (!formTitle.value.trim()) {
    formError.value = 'Title is required'
    return
  }
  if (!formAuthorId.value) {
    formError.value = 'Author is required'
    return
  }
  if (!formContent.value.trim()) {
    formError.value = 'Content is required'
    return
  }

  formLoading.value = true
  formError.value = null

  try {
    if (editingArticle.value) {
      // Update existing article
      await ArticleService.update(editingArticle.value.id, {
        title: formTitle.value.trim(),
        author_id: formAuthorId.value,
        content: formContent.value.trim()
      })
    } else {
      // Create new article
      await ArticleService.create({
        title: formTitle.value.trim(),
        author_id: formAuthorId.value,
        content: formContent.value.trim()
      })
    }

    await fetchArticles()
    closeForm()
  } catch (err: any) {
    formError.value = err.response?.data?.error || 'Failed to save article'
    console.error('Error saving article:', err)
  } finally {
    formLoading.value = false
  }
}

const deleteArticle = async (article: Article) => {
  if (!confirm(`Are you sure you want to delete "${article.title}"?`)) {
    return
  }

  try {
    await ArticleService.delete(article.id)
    await fetchArticles()
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to delete article')
    console.error('Error deleting article:', err)
  }
}

const getAuthorName = (authorId: string): string => {
  const author = authors.value.find(a => a.id === authorId)
  return author ? author.name : `Unknown (${authorId})`
}

onMounted(() => {
  fetchArticles()
  fetchAuthors()
})
</script>

<template>
  <div class="articles">
    <div class="header">
      <h2>Articles</h2>
      <div class="header-actions">
        <button @click="openCreateForm" class="btn-primary">
          + New Article
        </button>
        <button @click="fetchArticles" class="btn-refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchArticles" class="btn">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="articles.length === 0" class="empty">
      <p>No articles found</p>
      <button @click="openCreateForm" class="btn-primary">Create First Article</button>
    </div>

    <!-- Articles List -->
    <div v-else class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <div class="article-content">
          <h3>{{ article.title }}</h3>
          <p class="article-meta">
            <span class="author-name">By: {{ getAuthorName(article.author_id) }}</span>
            <span v-if="article.created_at" class="date">
              {{ formatDate(article.created_at) }}
            </span>
          </p>
          <p class="article-text">{{ article.content }}</p>
          <div class="article-footer">
            <span class="article-id">ID: {{ article.id }}</span>
          </div>
        </div>
        <div class="article-actions">
          <!-- TODO to admin only -->
<!--          <router-link :to="`/articles/${article.id}/rankings`" class="btn-rankings">-->
<!--            Rankings-->
<!--          </router-link>-->
          <router-link :to="`/articles/${article.id}/rankings-groups`" class="btn-rankings">
            Rankings groups
          </router-link>
          <button @click="openEditForm(article)" class="btn-edit">Edit</button>
          <button @click="deleteArticle(article)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingArticle ? 'Edit Article' : 'Create New Article' }}</h3>
          <button @click="closeForm" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveArticle" class="modal-body">
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="formTitle"
              type="text"
              placeholder="Enter article title"
              required
              :disabled="formLoading"
            />
          </div>
          <div class="form-group">
            User : {{ formUserId}}
          </div>

          <div class="form-group">
            <label for="author">Author *</label>
            <select
              id="author"
              v-model="formAuthorId"
              required
              :disabled="formLoading"
            >
              <option value="">Select an author</option>
              <option v-for="author in authors" :key="author.id" :value="author.id">
                {{ author.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="content">Content *</label>
            <textarea
              id="content"
              v-model="formContent"
              placeholder="Enter article content"
              rows="8"
              required
              :disabled="formLoading"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeForm" class="btn-cancel" :disabled="formLoading">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : (editingArticle ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #229954;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.3s;
}

.article-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-content {
  flex: 1;
}

.article-content h3 {
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

.author-name {
  font-weight: 500;
}

.date {
  color: #95a5a6;
}

.article-text {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.article-footer {
  font-size: 0.8rem;
  color: #95a5a6;
}

.article-id {
  font-family: monospace;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-rankings {
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
}

.btn-rankings:hover {
  background-color: #8e44ad;
}

.btn-edit {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-edit:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-delete:hover {
  background-color: #c0392b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #95a5a6;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.btn-close:hover {
  color: #7f8c8d;
}

.modal-body {
  padding: 1.5rem;
}

.form-error {
  background-color: #ffe6e6;
  color: #c0392b;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
