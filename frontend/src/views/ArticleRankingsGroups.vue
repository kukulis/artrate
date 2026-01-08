<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import RankingService from '../services/RankingService'
import UsersService from '../services/UsersService'
import type {Ranking, RankingHelper, RankingType} from '../types/ranking'
import type {User} from '../types/user'
import {formatDate} from '../utils/dateFormat'
import ArticleService from "../services/ArticleService.ts";
import {Article} from "../types/article.ts";
import {RankingGroup} from "../types/ranking-group.ts";

const route = useRoute()
const router = useRouter()
const articleId = ref<string>(route.params.article_id as string)

const rankingsGroups = ref<RankingGroup[]>([])
const rankingTypes = ref<RankingType[]>([])
const rankingHelpers = ref<RankingHelper[]>([])
const currentUser = ref<User | null>(null)
const currentArticle = ref<Article | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingRanking = ref<Ranking | null>(null)

// Form fields
const formUserId = ref<number>(0)
const formArticleId = ref('')
const formRankingType = ref('')
const formHelperType = ref('')
const formValue = ref<number>(0)
const formDescription = ref('')
const formError = ref<string | null>(null)
const formLoading = ref(false)

const articleTitle = computed(() => {
  return 'Article [' + (currentArticle.value ? currentArticle.value.title : '-') + ']'
})

const fetchRankingsGroups = async () => {
  loading.value = true
  error.value = null
  try {
    rankingsGroups.value = await RankingService.getRankingGroups(articleId.value)
  } catch (err) {
    error.value = 'Failed to load rankings groups'
    console.error('Error fetching rankings groups:', err)
  } finally {
    loading.value = false
  }
}

const fetchMetadata = async () => {
  try {
    const [types, helpers, user, article] = await Promise.all([
      RankingService.getRankingTypes(1),
      RankingService.getRankingHelpers(),
      UsersService.getCurrentUser(),
      ArticleService.getById(articleId.value)
    ])
    rankingTypes.value = types
    rankingHelpers.value = helpers
    currentUser.value = user
    currentArticle.value = article
  } catch (err) {
    console.error('Error fetching metadata:', err)
  }
}

const openCreateForm = () => {
  editingRanking.value = null
  formUserId.value = currentUser.value ? currentUser.value.id : 0
  formArticleId.value = articleId.value
  formRankingType.value = ''
  formHelperType.value = ''
  formValue.value = 5
  formDescription.value = ''
  formError.value = null
  showForm.value = true
}

const openEditForm = (ranking: Ranking) => {
  editingRanking.value = ranking
  formUserId.value = ranking.user_id
  formArticleId.value = ranking.article_id
  formRankingType.value = ranking.ranking_type
  formHelperType.value = ranking.helper_type
  formValue.value = ranking.value
  formDescription.value = ranking.description
  formError.value = null
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingRanking.value = null
  formUserId.value = 0
  formArticleId.value = ''
  formRankingType.value = ''
  formHelperType.value = ''
  formValue.value = 0
  formDescription.value = ''
  formError.value = null
}

const saveRankingGroup = async () => {
  // Validation
  if (!formUserId.value) {
    formError.value = 'User ID is required'
    return
  }
  if (!formArticleId.value) {
    formError.value = 'Article ID is required'
    return
  }
  if (!formRankingType.value) {
    formError.value = 'Ranking type is required'
    return
  }
  if (!formHelperType.value) {
    formError.value = 'Helper type is required'
    return
  }
  if (formValue.value < 0 || formValue.value > 10) {
    formError.value = 'Value must be between 0 and 10'
    return
  }
  if (!formDescription.value.trim()) {
    formError.value = 'Description is required'
    return
  }

  formLoading.value = true
  formError.value = null

  try {
    const rankingData = {
      user_id: formUserId.value,
      article_id: formArticleId.value,
      ranking_type: formRankingType.value,
      helper_type: formHelperType.value,
      value: formValue.value,
      description: formDescription.value.trim()
    }

    if (editingRanking.value) {
      // Update existing ranking
      await RankingService.update(editingRanking.value.id, rankingData)
    } else {
      // Create new ranking
      await RankingService.create(rankingData)
    }

    await fetchRankingsGroups()
    closeForm()
  } catch (err: any) {
    formError.value = err.response?.data?.error || 'Failed to save ranking'
    console.error('Error saving ranking:', err)
  } finally {
    formLoading.value = false
  }
}

const deleteRankingGroup = async (rankingGroup: RankingGroup) => {

  console.log('TODO delete rankingGroup', rankingGroup)

  // const typeName = rankingTypes.value.find(t => t.code === ranking.ranking_type)?.description || ranking.ranking_type
  // if (!confirm(`Are you sure you want to delete the "${typeName}" ranking?`)) {
  //   return
  // }
  //
  // try {
  //   await RankingService.delete(ranking.id)
  //   await fetchRankingsGroups()
  // } catch (err: any) {
  //   alert(err.response?.data?.error || 'Failed to delete ranking')
  //   console.error('Error deleting ranking:', err)
  // }
}

const getRankingTypeName = (code: string): string => {
  const type = rankingTypes.value.find(t => t.code === code)
  return type ? type.description : code
}

const getHelperName = (code: string): string => {
  const helper = rankingHelpers.value.find(h => h.code === code)
  return helper ? helper.description : code
}

const goBackToArticles = () => {
  router.push('/articles')
}

onMounted(() => {
  fetchRankingsGroups()
  fetchMetadata()
})
</script>

<template>
  <div class="rankings">
    <div class="header">
      <div class="header-title">
        <button @click="goBackToArticles" class="btn-back">← Back to Articles</button>
        <h2>Rankings Groups for {{ articleTitle }}</h2>
      </div>
      <div class="header-actions">
        <button @click="openCreateForm" class="btn-primary">
          + New Ranking
        </button>
        <button @click="fetchRankingsGroups" class="btn-refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading rankings groups...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchRankingsGroups" class="btn">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="rankingsGroups.length === 0" class="empty">
      <p>No rankings found for this article</p>
      <button @click="openCreateForm" class="btn-primary">Create First Ranking Group</button>
    </div>

    <!-- Rankings groups List -->
    <div v-else class="rankings-list">
      <div v-for="rankingGroup in rankingsGroups" :key="rankingGroup.buildGroupKey()" class="ranking-card">
        <div class="ranking-content">
          <div class="ranking-header">
            <h3>{{ 'TODO' /* getRankingTypeName(rankingGroup.rankingType)*/ }}</h3>
            <span class="ranking-value">{{ 'TODO' /*ranking.value*/ }}/10</span>
          </div>
          <p class="ranking-description">{{ 'TODO' /* ranking.description */ }}</p>
          <div class="ranking-meta">
            <span class="meta-item">
              <strong>Helper:</strong> {{ getHelperName(rankingGroup.helperType) }}
            </span>
            <span class="meta-item">
              <strong>User ID:</strong> {{ rankingGroup.userId }}
            </span>
<!--            <span v-if="ranking.created_at" class="meta-item">-->
<!--              {{ formatDate(ranking.created_at) }}-->
<!--            </span>-->
          </div>
<!--          <div class="ranking-id">ID: {{ ranking.id }}</div>-->
        </div>
        <div class="ranking-actions">
          <button @click="openEditForm(rankingGroup)" class="btn-edit">Edit</button>
          <button @click="deleteRankingGroup(rankingGroup)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingRanking ? 'Edit Ranking Group' : 'Create New Ranking Group' }}</h3>
          <button @click="closeForm" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveRankingGroup" class="modal-body">
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="form-group">
            <label for="user-id">User ID *</label>
            <input
                id="user-id"
                v-model="formUserId"
                type="text"
                readonly
                disabled
                class="readonly-field"
            />
            <small class="field-note">User ID is set automatically</small>
          </div>

          <div class="form-group">
            <label for="article-id">Article ID *</label>
            <input
                id="article-id"
                v-model="formArticleId"
                type="text"
                readonly
                disabled
                class="readonly-field"
            />
            <small class="field-note">Article ID is based on current article</small>
          </div>

          <!-- Tipų dropdownas -->
          <div class="form-group">
            <label for="ranking-type">Ranking Type *</label>
            <select
                id="ranking-type"
                v-model="formRankingType"
                required
                :disabled="formLoading"
            >
              <option value="">Select a ranking type</option>
              <option v-for="type in rankingTypes" :key="type.code" :value="type.code">
                {{ type.description }}
              </option>
            </select>
          </div>

          <!-- Helperių dropdownas -->
          <div class="form-group">
            <label for="helper-type">Helper Type *</label>
            <select
                id="helper-type"
                v-model="formHelperType"
                required
                :disabled="formLoading"
            >
              <option value="">Select a helper type</option>
              <option v-for="helper in rankingHelpers" :key="helper.code" :value="helper.code">
                {{ helper.description }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="value">Value (0-10) *</label>
            <input
                id="value"
                v-model.number="formValue"
                type="number"
                min="0"
                max="10"
                step="0.1"
                required
                :disabled="formLoading"
            />
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
                id="description"
                v-model="formDescription"
                placeholder="Enter ranking description"
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
              {{ formLoading ? 'Saving...' : (editingRanking ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rankings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.header-title h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-back {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-back:hover {
  background-color: #7f8c8d;
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

.rankings-list {
  display: grid;
  gap: 1.5rem;
}

.ranking-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.3s;
}

.ranking-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-content {
  flex: 1;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ranking-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.ranking-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
  background-color: #e8f5e9;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.ranking-description {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.ranking-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.meta-item {
  display: flex;
  gap: 0.25rem;
}

.ranking-id {
  font-size: 0.8rem;
  color: #95a5a6;
  font-family: monospace;
}

.ranking-actions {
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

.readonly-field {
  background-color: #ecf0f1 !important;
  color: #7f8c8d;
  cursor: not-allowed !important;
}

.field-note {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #95a5a6;
  font-style: italic;
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
