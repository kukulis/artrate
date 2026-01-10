<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import RankingService from '../services/RankingService'
import UsersService from '../services/UsersService'
import type {RankingHelper, RankingType} from '../types/ranking'
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

// Form fields
const formUserId = ref<number>(0)
const formArticleId = ref('')
const formHelperType = ref('')

const formValues = ref<Record<string, number>>({});
const formDescriptions = ref<Record<string, string>>({})

function initializeFormValuesAndDescriptions(rankingGroup: RankingGroup) {
  for (const key in rankingGroup.rankings) {
    const ranking = rankingGroup.rankings[key];
    formValues.value[key] = ranking.value;
    formDescriptions.value[key] = ranking.description;
  }
}

function extractFromValuesAndDescriptions(rankingGroup: RankingGroup) {
  for (const key in rankingGroup.rankings) {
    const ranking = rankingGroup.rankings[key];
    ranking.value = formValues.value[key]
    ranking.description = formDescriptions.value[key]
  }
}


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
  formUserId.value = currentUser.value ? currentUser.value.id : 0
  formArticleId.value = articleId.value
  formHelperType.value = 'USER'
  formError.value = null
  showForm.value = true
}

const openEditForm = (rankingGroup: RankingGroup) => {
  formUserId.value = rankingGroup.userId
  formArticleId.value = rankingGroup.articleId
  formHelperType.value = rankingGroup.helperType
  const rankingTypesCodes = rankingTypes.value.map((rt: RankingType) => rt.code)
  rankingGroup.fillMissingRankings(rankingTypesCodes, 5)
  initializeFormValuesAndDescriptions(rankingGroup)
  formError.value = null
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  formUserId.value = 0
  formArticleId.value = ''
  formHelperType.value = ''
  formError.value = null
}

const saveRankingGroup = async () => {
  formLoading.value = true
  formError.value = null

  try {

    let rankingGroup = RankingGroup.createGroup(
        formHelperType.value,
        formUserId.value,
        formArticleId.value,
        rankingTypes.value.map(rt => rt.code)
    )

    extractFromValuesAndDescriptions(rankingGroup)

    // validate rankings?
    const upsertResult = await RankingService.upsert(Object.values(rankingGroup.rankings))
    console.log('ArticleRankingsGroups.vue: upsertResult: ', upsertResult)

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
  // const typeName = rankingTypes.value.find(t => t.code === ranking.ranking_type)?.description || ranking.ranking_type
  if (!confirm(`Are you sure you want to delete these rankings?`)) {
    return
  }

  loading.value = true;

  try {
    for (const rankingType in rankingGroup.rankings) {
      const ranking = rankingGroup.rankings[rankingType]

      if (ranking.id !== '') {
        await RankingService.delete(ranking.id)
      }
    }

    await fetchRankingsGroups()
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to delete ranking')
    console.error('Error deleting ranking:', err)
  }
  finally {
    loading.value = false;
  }
}

// const getRankingTypeName = (code: string): string => {
//   const type = rankingTypes.value.find(t => t.code === code)
//   return type ? type.description : code
// }

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
    </div>

    <!-- Rankings groups List -->
    <div v-else class="rankings-list">
      <div v-for="rankingGroup in rankingsGroups" :key="rankingGroup.buildGroupKey()" class="ranking-card">
        <div class="ranking-content">
            <span class="meta-item">
              <strong>Helper:</strong> {{ getHelperName(rankingGroup.helperType) }}
            </span>
          <span class="meta-item">
              <strong>User ID:</strong> {{ rankingGroup.userId }}
            </span>
          <p class="ranking-description">{{ rankingGroup.buildValuesRepresentation() }}</p>
          <p class="ranking-meta">{{ formatDate( rankingGroup.getDate() ) }}</p>
        </div>
        <div class="ranking-actions">
          <button @click="openEditForm(rankingGroup)" class="btn-edit">Edit</button>
          <button @click="deleteRankingGroup(rankingGroup)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3>{{ 'Edit Rankings' }}</h3>
          <button @click="closeForm" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveRankingGroup" class="modal-body">
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <!-- Compact Info Bar for Readonly Fields -->
          <div class="info-bar">
            <span><strong>User:</strong> {{ formUserId }}</span>
            <span><strong>Article:</strong> {{ formArticleId }}</span>
            <span><strong>Helper:</strong> {{ getHelperName(formHelperType) }}</span>
          </div>

          <!-- Compact Rankings Table -->
          <div class="rankings-table">
            <div class="rankings-header">
              <div class="col-type">Type</div>
              <div class="col-value">Value</div>
              <div class="col-description">Description</div>
            </div>

            <div v-for="rankingType in rankingTypes" :key="rankingType.code" class="ranking-row">
              <div class="col-type">
                <strong>{{ rankingType.code }}</strong>
                <small class="type-desc">{{ rankingType.description }}</small>
              </div>
              <div class="col-value">
                <input
                    v-model.number="formValues[rankingType.code]"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    :disabled="formLoading"
                    class="compact-input"
                />
              </div>
              <div class="col-description">
                <textarea
                    v-model="formDescriptions[rankingType.code]"
                    placeholder="Enter description"
                    rows="2"
                    required
                    :disabled="formLoading"
                    class="compact-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeForm" class="btn-cancel" :disabled="formLoading">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : 'Store' }}
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

.ranking-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
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

.modal-wide {
  max-width: 1000px;
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

.ranking-type-description {
  font-size: 0.8rem;
  color: #95a5a6;
}

/* Compact Info Bar */
.info-bar {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
}

.info-bar span {
  color: #2c3e50;
}

/* Compact Rankings Table */
.rankings-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.rankings-header {
  display: grid;
  grid-template-columns: 200px 100px 1fr;
  gap: 1rem;
  background-color: #34495e;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.ranking-row {
  display: grid;
  grid-template-columns: 200px 100px 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  align-items: start;
}

.ranking-row:last-child {
  border-bottom: none;
}

.ranking-row:hover {
  background-color: #f8f9fa;
}

.col-type {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.col-type strong {
  color: #2c3e50;
  font-size: 0.95rem;
}

.col-type .type-desc {
  color: #7f8c8d;
  font-size: 0.8rem;
  font-weight: normal;
}

.col-value {
  display: flex;
  align-items: center;
}

.col-description {
  display: flex;
  align-items: start;
}

.compact-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  text-align: center;
}

.compact-input:focus {
  outline: none;
  border-color: #3498db;
}

.compact-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 50px;
}

.compact-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.compact-input:disabled,
.compact-textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
