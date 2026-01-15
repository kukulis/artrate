<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminService from '../services/AdminService'
import AuthenticationHandler from '../services/AuthenticationHandler'
import type { SafeUserResponse } from '../types/api'

const router = useRouter()
const users = ref<SafeUserResponse[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref<number | null>(null)

const isAdmin = computed(() => {
    const user = AuthenticationHandler.getUser()

    return user?.role === 'admin' || user?.role === 'super_admin'
})

const loadUsers = async () => {
    loading.value = true
    error.value = null

    try {
        users.value = await AdminService.getUsers()
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to load users'
        console.error('Error loading users:', err)
    } finally {
        loading.value = false
    }
}

const toggleUserStatus = async (user: SafeUserResponse) => {
    actionLoading.value = user.id
    error.value = null

    try {
        if (user.is_active) {
            await AdminService.disableUser(user.id)
        } else {
            await AdminService.enableUser(user.id)
        }
        await loadUsers()
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to update user status'
        console.error('Error updating user status:', err)
    } finally {
        actionLoading.value = null
    }
}

const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'

    return new Date(dateString).toLocaleString()
}

const getRoleBadgeClass = (role: string): string => {
    switch (role) {
        case 'super_admin':
            return 'badge-super-admin'
        case 'admin':
            return 'badge-admin'
        default:
            return 'badge-user'
    }
}

onMounted(() => {
    if (!isAdmin.value) {
        router.push('/login')

        return
    }
    loadUsers()
})
</script>

<template>
    <div class="users-container">
        <h1>User Management</h1>

        <div v-if="!isAdmin" class="error-message">
            <p>Access denied. Admin privileges required.</p>
        </div>

        <div v-else>
            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div v-if="loading" class="loading">
                Loading users...
            </div>

            <div v-else-if="users.length === 0" class="empty-state">
                No users found.
            </div>

            <table v-else class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id" :class="{ 'inactive-row': !user.is_active }">
                        <td>{{ user.id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <span class="badge" :class="getRoleBadgeClass(user.role)">
                                {{ user.role }}
                            </span>
                        </td>
                        <td>
                            <span class="status" :class="user.is_active ? 'status-active' : 'status-inactive'">
                                {{ user.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.last_login_at) }}</td>
                        <td>{{ formatDate(user.created_at) }}</td>
                        <td>
                            <button
                                v-if="user.role !== 'super_admin'"
                                @click="toggleUserStatus(user)"
                                :disabled="actionLoading === user.id"
                                :class="user.is_active ? 'btn-disable' : 'btn-enable'"
                            >
                                {{ actionLoading === user.id ? 'Processing...' : (user.is_active ? 'Disable' : 'Enable') }}
                            </button>
                            <span v-else class="no-action">-</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="table-footer">
                <p>Total users: {{ users.length }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.users-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

h1 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
}

.error-message {
    background-color: #ffe6e6;
    color: #c0392b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.users-table th,
.users-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.users-table th {
    background-color: #2c3e50;
    color: white;
    font-weight: 500;
}

.users-table tbody tr:hover {
    background-color: #f8f9fa;
}

.inactive-row {
    background-color: #fafafa;
    color: #95a5a6;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.badge-super-admin {
    background-color: #9b59b6;
    color: white;
}

.badge-admin {
    background-color: #3498db;
    color: white;
}

.badge-user {
    background-color: #95a5a6;
    color: white;
}

.status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-active {
    background-color: #d4edda;
    color: #155724;
}

.status-inactive {
    background-color: #f8d7da;
    color: #721c24;
}

button {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: background-color 0.2s;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-disable {
    background-color: #e74c3c;
    color: white;
}

.btn-disable:hover:not(:disabled) {
    background-color: #c0392b;
}

.btn-enable {
    background-color: #27ae60;
    color: white;
}

.btn-enable:hover:not(:disabled) {
    background-color: #219a52;
}

.no-action {
    color: #95a5a6;
}

.table-footer {
    margin-top: 1rem;
    text-align: right;
    color: #7f8c8d;
    font-size: 0.9rem;
}
</style>
