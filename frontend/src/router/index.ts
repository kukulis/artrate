import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Articles from '../views/Articles.vue'
import Authors from '../views/Authors.vue'
import ArticleRankings from '../views/ArticleRankings.vue'
import ArticleRankingsGroups from "../views/ArticleRankingsGroups.vue";
import Login from "../views/Login.vue";
import Logout from "../views/Logout.vue";
import Register from "../views/Register.vue";
import ConfirmLogin from "../views/ConfirmLogin.vue";
import PasswordResetRequest from "../views/PasswordResetRequest.vue";
import PasswordResetConfirm from "../views/PasswordResetConfirm.vue";
import Users from "../views/Users.vue";
import AuthenticationHandler from "../services/AuthenticationHandler";

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
        },
        {
            path: '/logout',
            name: 'logout',
            component: Logout
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/confirm-login',
            name: 'confirm_login',
            component: ConfirmLogin
        },
        {
            path: '/password-reset-request',
            name: 'password_reset_request',
            component: PasswordResetRequest
        },
        {
            path: '/password-reset-confirm',
            name: 'password_reset_confirm',
            component: PasswordResetConfirm
        },
        {
            path: '/users',
            name: 'users',
            component: Users,
            meta: { requiresAdmin: true }
        }
    ]
})

// Navigation guard for admin-only routes
router.beforeEach((to, _from, next) => {
    if (to.meta.requiresAdmin) {
        const user = AuthenticationHandler.getUser()
        const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

        if (!isAdmin) {
            next({ name: 'login' })

            return
        }
    }
    next()
})

export default router
