<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthorService from '../services/AuthorService'
import type { Author } from '../types/author'
import { formatDate } from '../utils/dateFormat'

const authors = ref<Author[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingAuthor = ref<Author | null>(null)

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
        <button @click="openCreateForm" class="btn-primary">
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
      <button @click="openCreateForm" class="btn-primary">Create First Author</button>
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
          <button @click="openEditForm(author)" class="btn-edit">Edit</button>
          <button @click="deleteAuthor(author)" class="btn-delete">Delete</button>
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

.authors-list {
  display: grid;
  gap: 1.5rem;
}

.author-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.3s;
}

.author-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-content {
  flex: 1;
}

.author-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.author-description {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.author-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #95a5a6;
}

.author-id {
  font-family: monospace;
}

.author-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
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
  max-width: 500px;
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input:disabled,
.form-group textarea:disabled {
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
