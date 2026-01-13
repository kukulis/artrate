import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Articles from '../views/Articles.vue'
import Authors from '../views/Authors.vue'
import ArticleRankings from '../views/ArticleRankings.vue'
import ArticleRankingsGroups from "../views/ArticleRankingsGroups.vue";
import Login from "../views/Login.vue";

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
      path: '/articles/:article_id/rankings-groups',
      name: 'article-rankings-groups',
      component: ArticleRankingsGroups
    },
    {
      path: '/authors',
      name: 'authors',
      component: Authors
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

export default router
