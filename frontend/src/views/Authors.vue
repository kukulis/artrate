<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AuthorService from '../services/AuthorService'
import AuthenticationHandler from '../services/AuthenticationHandler'
import type { Author } from '../types/author'
import { formatDate } from '../utils/dateFormat'

const authors = ref<Author[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingAuthor = ref<Author | null>(null)

const currentUser = computed(() => AuthenticationHandler.getUser())
const isLoggedIn = computed(() => currentUser.value !== null)
const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin')

// Form fields
const formName = ref('')
const formDescription = ref('')
const formError = ref<string | null>(null)
const formLoading = ref(false)

const fetchAuthors = async () => {
  loading.value = true
  error.value = null
  try {
    authors.value = await AuthorService.getAll()
  } catch (err) {
    error.value = 'Failed to load authors'
    console.error('Error fetching authors:', err)
  } finally {
    loading.value = false
  }
}

const openCreateForm = () => {
  editingAuthor.value = null
  formName.value = ''
  formDescription.value = ''
  formError.value = null
  showForm.value = true
}

const openEditForm = (author: Author) => {
  editingAuthor.value = author
  formName.value = author.name
  formDescription.value = author.description
  formError.value = null
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingAuthor.value = null
  formName.value = ''
  formDescription.value = ''
  formError.value = null
}

const saveAuthor = async () => {
  // Validation
  if (!formName.value.trim()) {
    formError.value = 'Name is required'
    return
  }
  if (!formDescription.value.trim()) {
    formError.value = 'Description is required'
    return
  }

  formLoading.value = true
  formError.value = null

  try {
    if (editingAuthor.value) {
      // Update existing author
      await AuthorService.update(editingAuthor.value.id, {
        name: formName.value.trim(),
        description: formDescription.value.trim()
      })
    } else {
      // Create new author
      await AuthorService.create({
        name: formName.value.trim(),
        description: formDescription.value.trim()
      })
    }

    await fetchAuthors()
    closeForm()
  } catch (err: any) {
    formError.value = err.response?.data?.error || 'Failed to save author'
    console.error('Error saving author:', err)
  } finally {
    formLoading.value = false
  }
}

const deleteAuthor = async (author: Author) => {
  if (!confirm(`Are you sure you want to delete "${author.name}"?`)) {
    return
  }

  try {
    await AuthorService.delete(author.id)
    await fetchAuthors()
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to delete author')
    console.error('Error deleting author:', err)
  }
}

onMounted(() => {
  fetchAuthors()
})
</script>

<template>
  <div class="authors">
    <div class="header">
      <h2>Authors</h2>
      <div class="header-actions">
        <button v-if="isLoggedIn" @click="openCreateForm" class="btn-primary">
          + New Author
        </button>
        <button @click="fetchAuthors" class="btn-refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading authors...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchAuthors" class="btn">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="authors.length === 0" class="empty">
      <p>No authors found</p>
      <button v-if="isLoggedIn" @click="openCreateForm" class="btn-primary">Create First Author</button>
    </div>

    <!-- Authors List -->
    <div v-else class="authors-list">
      <div v-for="author in authors" :key="author.id" class="author-card">
        <div class="author-content">
          <h3>{{ author.name }}</h3>
          <p class="author-description">{{ author.description }}</p>
          <div class="author-meta">
            <span class="author-id">ID: {{ author.id }}</span>
            <span v-if="author.created_at" class="date">
              Created: {{ formatDate(author.created_at) }}
            </span>
          </div>
        </div>
        <div class="author-actions">
          <button v-if="isAdmin" @click="openEditForm(author)" class="btn-edit">Edit</button>
          <button v-if="isAdmin" @click="deleteAuthor(author)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingAuthor ? 'Edit Author' : 'Create New Author' }}</h3>
          <button @click="closeForm" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveAuthor" class="modal-body">
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="form-group">
            <label for="name">Name *</label>
            <input
              id="name"
              v-model="formName"
              type="text"
              placeholder="Enter author name"
              required
              :disabled="formLoading"
            />
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="formDescription"
              placeholder="Enter author description"
              rows="4"
              required
              :disabled="formLoading"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeForm" class="btn-cancel" :disabled="formLoading">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : (editingAuthor ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.authors {
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

.authors-list {
    display: grid;
    gap: var(--spacing-lg);
}

.author-card {
    background: var(--color-paper-light);
    border: 1px solid var(--color-paper-dark);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: box-shadow 0.3s;
}

.author-card:hover {
    box-shadow: var(--shadow-md);
}

.author-content {
    flex: 1;
}

.author-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-family: var(--font-display);
    color: var(--color-ink);
    font-size: 1.4rem;
}

.author-description {
    font-family: var(--font-reading);
    color: var(--color-ink-light);
    line-height: 1.7;
    margin-bottom: var(--spacing-md);
}

.author-meta {
    display: flex;
    gap: var(--spacing-lg);
    font-size: 0.8rem;
    color: var(--color-ink-muted);
    font-family: var(--font-body);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-paper-dark);
}

.author-id {
    font-family: monospace;
    font-size: 0.7rem;
}

.author-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
    margin-left: var(--spacing-md);
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
    max-width: 500px;
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
.form-group textarea {
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
.form-group textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
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

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
