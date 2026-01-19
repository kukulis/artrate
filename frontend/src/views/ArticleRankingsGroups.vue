<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import RankingService from '../services/RankingService'
import UsersService from '../services/UsersService'
import type {RankingHelper, RankingType} from '../types/ranking'
import type {User} from '../types/user'
import {formatDate} from '../utils/dateFormat'
import ArticleService from "../services/ArticleService.ts";
import AdminService from '../services/AdminService'
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

// AI Ranking modal state
const showAiRankingModal = ref(false)
const selectedAiHelper = ref('')
const aiRankingLoading = ref(false)
const aiRankingError = ref<string | null>(null)
const aiRankingSuccess = ref<string | null>(null)

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

const aiHelpers = computed(() => {
    return rankingHelpers.value.filter(helper => helper.code !== 'USER')
})

const isAdmin = computed(() => {
    return currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin'
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

    if (!rankingGroup) {
        throw new Error('Ranking group is null')
    }

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

const openAiRankingModal = () => {
    selectedAiHelper.value = aiHelpers.value.length > 0 ? aiHelpers.value[0].code : ''
    aiRankingError.value = null
    aiRankingSuccess.value = null
    showAiRankingModal.value = true
}

const closeAiRankingModal = () => {
    showAiRankingModal.value = false
    selectedAiHelper.value = ''
    aiRankingError.value = null
    aiRankingSuccess.value = null
}

const executeAiEvaluation = async () => {
    if (!selectedAiHelper.value) {
        aiRankingError.value = 'Please select an AI helper'

        return
    }

    aiRankingLoading.value = true
    aiRankingError.value = null
    aiRankingSuccess.value = null

    try {
        await AdminService.evaluateRanking({
            articleId: articleId.value,
            helperType: selectedAiHelper.value
        })
        aiRankingSuccess.value = 'AI evaluation completed successfully'
        await fetchRankingsGroups()
        setTimeout(() => closeAiRankingModal(), 2000)
    } catch (err: any) {
        aiRankingError.value = err.response?.data?.error || 'Failed to execute AI evaluation'
    } finally {
        aiRankingLoading.value = false
    }
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
        <button v-if="isAdmin" @click="openAiRankingModal" class="btn-ai-ranking">
          AI Ranking
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

    <!-- AI Ranking Modal -->
    <div v-if="showAiRankingModal" class="modal-overlay" @click.self="closeAiRankingModal">
      <div class="modal">
        <div class="modal-header">
          <h3>AI Ranking Evaluation</h3>
          <button @click="closeAiRankingModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="aiRankingError" class="form-error">{{ aiRankingError }}</div>
          <div v-if="aiRankingSuccess" class="form-success">{{ aiRankingSuccess }}</div>

          <div class="form-group">
            <label for="ai-helper-select">Select AI Helper</label>
            <select id="ai-helper-select" v-model="selectedAiHelper" :disabled="aiRankingLoading">
              <option v-for="helper in aiHelpers" :key="helper.code" :value="helper.code">
                {{ helper.description }}
              </option>
            </select>
          </div>

          <div class="info-bar">
            <span><strong>Article:</strong> {{ articleTitle }}</span>
          </div>

          <div class="modal-footer">
            <button @click="closeAiRankingModal" class="btn-cancel" :disabled="aiRankingLoading">Cancel</button>
            <button @click="executeAiEvaluation" class="btn-primary" :disabled="aiRankingLoading || !selectedAiHelper">
              {{ aiRankingLoading ? 'Executing...' : 'Execute AI Evaluation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rankings {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-md);
}

.header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--color-sepia-light);
}

.header-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.header-title h2 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--color-ink);
}

.btn-back {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-sepia);
    color: var(--color-paper);
    border: 2px solid var(--color-sepia);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back:hover {
    background-color: transparent;
    color: var(--color-sepia);
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

.rankings-list {
    display: grid;
    gap: var(--spacing-lg);
}

.ranking-card {
    background: var(--color-paper-light);
    border: 1px solid var(--color-paper-dark);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: box-shadow 0.3s;
}

.ranking-card:hover {
    box-shadow: var(--shadow-md);
}

.ranking-content {
    flex: 1;
}

.ranking-header h3 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--color-ink);
    font-size: 1.3rem;
}

.ranking-description {
    font-family: var(--font-reading);
    color: var(--color-ink-light);
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
}

.ranking-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
    font-size: 0.9rem;
    color: var(--color-ink-muted);
    font-family: var(--font-body);
    margin-bottom: var(--spacing-sm);
}

.meta-item {
    display: flex;
    gap: var(--spacing-xs);
}

.ranking-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
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

.modal-wide {
    max-width: 1000px;
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

.readonly-field {
    background-color: var(--color-paper-dark) !important;
    color: var(--color-ink-muted);
    cursor: not-allowed !important;
}

.field-note {
    display: block;
    margin-top: var(--spacing-xs);
    font-size: 0.85rem;
    color: var(--color-sepia);
    font-style: italic;
    font-family: var(--font-body);
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

.ranking-type-description {
    font-size: 0.8rem;
    color: var(--color-sepia);
    font-family: var(--font-body);
}

/* Compact Info Bar */
.info-bar {
    background-color: var(--color-paper);
    border: 1px solid var(--color-paper-dark);
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    display: flex;
    gap: var(--spacing-xl);
    font-size: 0.9rem;
    font-family: var(--font-body);
}

.info-bar span {
    color: var(--color-ink);
}

/* Compact Rankings Table */
.rankings-table {
    border: 1px solid var(--color-paper-dark);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.rankings-header {
    display: grid;
    grid-template-columns: 200px 100px 1fr;
    gap: var(--spacing-md);
    background-color: var(--color-ink);
    color: var(--color-paper);
    padding: var(--spacing-md);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 3px double var(--color-gold);
}

.ranking-row {
    display: grid;
    grid-template-columns: 200px 100px 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-paper-dark);
    align-items: start;
}

.ranking-row:last-child {
    border-bottom: none;
}

.ranking-row:hover {
    background-color: var(--color-paper);
}

.col-type {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.col-type strong {
    font-family: var(--font-body);
    color: var(--color-ink);
    font-size: 0.95rem;
}

.col-type .type-desc {
    color: var(--color-ink-muted);
    font-size: 0.8rem;
    font-weight: normal;
    font-family: var(--font-body);
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
    padding: var(--spacing-sm);
    border: 1px solid var(--color-sepia-light);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    font-family: var(--font-body);
    text-align: center;
    background-color: var(--color-paper);
    color: var(--color-ink);
}

.compact-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.compact-textarea {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--color-sepia-light);
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-family: var(--font-body);
    background-color: var(--color-paper);
    color: var(--color-ink);
    resize: vertical;
    min-height: 50px;
}

.compact-textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.compact-input:disabled,
.compact-textarea:disabled {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
    cursor: not-allowed;
}

.btn-ai-ranking {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--color-sepia);
    color: var(--color-paper);
    border: 2px solid var(--color-sepia);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-ai-ranking:hover:not(:disabled) {
    background-color: var(--color-sepia-dark);
    border-color: var(--color-sepia-dark);
}

.form-success {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-success);
    margin-bottom: var(--spacing-md);
    font-family: var(--font-body);
    font-size: 0.9rem;
}
</style>
