import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Articles from '../views/Articles.vue'
import Authors from '../views/Authors.vue'
import ArticleRankings from '../views/ArticleRankings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/articles',
      name: 'articles',
      component: Articles
    },
    {
      path: '/articles/:article_id/rankings',
      name: 'article-rankings',
      component: ArticleRankings
    },
    {
      path: '/authors',
      name: 'authors',
      component: Authors
    }
  ]
})

export default router
