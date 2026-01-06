# Service Layer - Example Usage

## How to use services in Vue components

### Example 1: Fetch all articles

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ArticleService from '../services/ArticleService'
import type { Article } from '../types/article'

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
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div>
    <h2>Articles</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else>
      <li v-for="article in articles" :key="article.id">
        {{ article.title }}
      </li>
    </ul>
  </div>
</template>
```

### Example 2: Create a new article

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ArticleService from '../services/ArticleService'

const title = ref('')
const content = ref('')
const authorId = ref('')

const createArticle = async () => {
  try {
    const newArticle = await ArticleService.create({
      title: title.value,
      content: content.value,
      author_id: authorId.value
    })
    console.log('Created:', newArticle)
    // Reset form or redirect
  } catch (err) {
    console.error('Failed to create article:', err)
  }
}
</script>

<template>
  <form @submit.prevent="createArticle">
    <input v-model="title" placeholder="Title" />
    <textarea v-model="content" placeholder="Content" />
    <input v-model="authorId" placeholder="Author ID" />
    <button type="submit">Create Article</button>
  </form>
</template>
```

### Example 3: Get rankings with filters

```vue
<script setup lang="ts">
import { ref } from 'vue'
import RankingService from '../services/RankingService'
import type { Ranking } from '../types/ranking'

const rankings = ref<Ranking[]>([])

const fetchUserRankings = async (userId: string) => {
  try {
    rankings.value = await RankingService.getAll({ user_id: userId })
  } catch (err) {
    console.error('Failed to load rankings:', err)
  }
}

const fetchArticleRankings = async (articleId: string) => {
  try {
    rankings.value = await RankingService.getAll({ article_id: articleId })
  } catch (err) {
    console.error('Failed to load rankings:', err)
  }
}
</script>
```

### Example 4: Upsert multiple rankings

```vue
<script setup lang="ts">
import RankingService from '../services/RankingService'

const upsertRankings = async () => {
  try {
    const result = await RankingService.upsert([
      {
        ranking_type: 'OBJECTIVITY',
        helper_type: 'USER',
        user_id: '101',
        article_id: 'article-1',
        value: 8,
        description: 'Very objective'
      },
      {
        ranking_type: 'OFFENSIVE',
        helper_type: 'USER',
        user_id: '101',
        article_id: 'article-1',
        value: 2,
        description: 'Not offensive'
      }
    ])
    console.log(`Upserted ${result.count} rankings`)
  } catch (err) {
    console.error('Failed to upsert rankings:', err)
  }
}
</script>
```

## Benefits of this architecture:

1. **Centralized API calls** - All backend communication in one place
2. **Type safety** - TypeScript interfaces for all data
3. **Reusability** - Import service anywhere in your app
4. **Maintainability** - Easy to update endpoints or add features
5. **Testing** - Easy to mock services in tests
6. **Interceptors** - Global error handling, auth tokens, logging

## Structure:

```
src/
├── types/
│   ├── article.ts          # Article type definitions
│   ├── author.ts           # Author type definitions
│   └── ranking.ts          # Ranking type definitions
├── services/
│   ├── api.ts              # Base axios instance
│   ├── ArticleService.ts   # Article-related calls
│   ├── AuthorService.ts    # Author-related calls
│   └── RankingService.ts   # Ranking-related calls
└── views/
    └── Articles.vue        # Import services and types here
```
