<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ArticleService from '../services/ArticleService'
import AuthorService from '../services/AuthorService'
import AuthenticationHandler from '../services/AuthenticationHandler'
import type { Article } from '../types/article'
import type { Author } from '../types/author'
import { formatDate } from '../utils/dateFormat'

const articles = ref<Article[]>([])
const authors = ref<Author[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingArticle = ref<Article | null>(null)

const currentUser = computed(() => AuthenticationHandler.getUser())
const isLoggedIn = computed(() => currentUser.value !== null)
const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin')

const canEditArticle = (article: Article): boolean => {
    if (!currentUser.value) return false
    if (isAdmin.value) return true

    return article.user_id === currentUser.value.id
}

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

const truncateContent = (content: string, maxLength: number = 200): string => {
  if (content.length <= maxLength) return content

  return content.substring(0, maxLength).trim() + '...'
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
        <button v-if="isLoggedIn" @click="openCreateForm" class="btn-primary">
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
      <button v-if="isLoggedIn" @click="openCreateForm" class="btn-primary">Create First Article</button>
    </div>

    <!-- Articles List -->
    <div v-else class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <div class="article-content">
          <h3><router-link :to="`/articles/${article.id}/rankings-groups`" class="article-title-link">{{ article.title }}</router-link></h3>
          <p class="article-meta">
            <span class="author-name">By: {{ getAuthorName(article.author_id) }}</span>
            <span v-if="article.created_at" class="date">
              {{ formatDate(article.created_at) }}
            </span>
          </p>
          <p class="article-text">{{ truncateContent(article.content) }}</p>
          <div class="article-footer">
            <span class="article-user">User: {{ article.user_id }}</span>
            <span class="article-id">ID: {{ article.id }}</span>
          </div>
        </div>
        <div class="article-actions">
          <button v-if="canEditArticle(article)" @click="openEditForm(article)" class="btn-edit">Edit</button>
          <button v-if="canEditArticle(article)" @click="deleteArticle(article)" class="btn-delete">Delete</button>
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
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--color-sepia-light);
}

.header h2 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--color-ink);
}

.header-actions {
    display: flex;
    gap: var(--spacing-md);
}

.btn-primary {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-accent);
    color: var(--color-paper);
    border: 2px solid var(--color-accent);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--color-accent-dark);
    border-color: var(--color-accent-dark);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-refresh {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: transparent;
    color: var(--color-sepia-dark);
    border: 2px solid var(--color-sepia);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
    background-color: var(--color-sepia);
    color: var(--color-paper);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading,
.empty {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-ink-muted);
    font-family: var(--font-body);
    font-style: italic;
}

.error {
    text-align: center;
    padding: var(--spacing-xl);
    background-color: var(--color-error-bg);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-error);
    color: var(--color-error);
}

.error .btn {
    margin-top: var(--spacing-md);
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-error);
    color: var(--color-paper);
    border: 2px solid var(--color-error);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
}

.error .btn:hover {
    background-color: transparent;
    color: var(--color-error);
}

.articles-list {
    display: grid;
    gap: var(--spacing-lg);
}

.article-card {
    background: var(--color-paper-light);
    border: 1px solid var(--color-paper-dark);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: box-shadow 0.3s;
}

.article-card:hover {
    box-shadow: var(--shadow-md);
}

.article-content {
    flex: 1;
}

.article-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-family: var(--font-display);
    color: var(--color-ink);
    font-size: 1.4rem;
}

.article-meta {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    font-family: var(--font-body);
}

.author-name {
    font-weight: 700;
    font-style: italic;
}

.date {
    color: var(--color-sepia);
}

.article-text {
    font-family: var(--font-reading);
    color: var(--color-ink-light);
    line-height: 1.7;
    margin-bottom: var(--spacing-md);
    white-space: pre-wrap;
}

.article-footer {
    font-size: 0.75rem;
    color: var(--color-ink-muted);
    font-family: var(--font-body);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-paper-dark);
}

.article-user {
    margin-right: var(--spacing-md);
}

.article-id {
    font-family: monospace;
    font-size: 0.7rem;
}

.article-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
    margin-left: var(--spacing-md);
}

.article-title-link {
    color: var(--color-ink);
    text-decoration: none;
    transition: color 0.2s ease;
}

.article-title-link:hover {
    color: var(--color-accent);
    text-decoration: underline;
}

.btn-rankings {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-sepia-dark);
    color: var(--color-paper);
    border: 2px solid var(--color-sepia-dark);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
}

.btn-rankings:hover {
    background-color: transparent;
    color: var(--color-sepia-dark);
    text-decoration: none;
}

.btn-edit {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-gold);
    color: var(--color-paper);
    border: 2px solid var(--color-gold);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-edit:hover {
    background-color: transparent;
    color: var(--color-gold);
}

.btn-delete {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-error);
    color: var(--color-paper);
    border: 2px solid var(--color-error);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-delete:hover {
    background-color: transparent;
    color: var(--color-error);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(44, 36, 22, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-paper-dark);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 2px solid var(--color-sepia-light);
}

.modal-header h3 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--color-ink);
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--color-sepia);
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 2rem;
    height: 2rem;
    transition: color 0.2s;
}

.btn-close:hover {
    color: var(--color-ink);
    background: none;
}

.modal-body {
    padding: var(--spacing-lg);
}

.form-error {
    background-color: var(--color-error-bg);
    color: var(--color-error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-error);
    margin-bottom: var(--spacing-md);
    font-family: var(--font-body);
    font-size: 0.9rem;
}

.form-group {
    margin-bottom: var(--spacing-lg);
}

.form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--color-ink);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-sepia-light);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-family: var(--font-body);
    background-color: var(--color-paper);
    color: var(--color-ink);
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
    cursor: not-allowed;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-paper-dark);
}

.btn-cancel {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: transparent;
    color: var(--color-ink-muted);
    border: 2px solid var(--color-sepia-light);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
    background-color: var(--color-paper-dark);
    border-color: var(--color-sepia);
    color: var(--color-ink);
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
