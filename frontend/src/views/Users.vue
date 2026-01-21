<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminService from '../services/AdminService'
import AuthenticationHandler from '../services/AuthenticationHandler'
import type { SafeUserResponse } from '../types/api'
import { formatDateTime } from '../utils/dateFormat'

const router = useRouter()
const users = ref<SafeUserResponse[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref<number | null>(null)
const roleLoading = ref<number | null>(null)

const isAdmin = computed(() => {
    const user = AuthenticationHandler.getUser()

    return user?.role === 'admin' || user?.role === 'super_admin'
})

const isSuperAdmin = computed(() => {
    const user = AuthenticationHandler.getUser()

    return user?.role === 'super_admin'
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

const updateUserRole = async (user: SafeUserResponse, newRole: 'user' | 'admin') => {
    if (user.role === newRole) {

        return
    }

    roleLoading.value = user.id
    error.value = null

    try {
        await AdminService.updateUserRole(user.id, newRole)
        await loadUsers()
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to update user role'
        console.error('Error updating user role:', err)
    } finally {
        roleLoading.value = null
    }
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
                            <select
                                v-if="isSuperAdmin && user.role !== 'super_admin'"
                                class="role-select"
                                :class="getRoleBadgeClass(user.role)"
                                :value="user.role"
                                :disabled="roleLoading === user.id"
                                @change="updateUserRole(user, ($event.target as HTMLSelectElement).value as 'user' | 'admin')"
                            >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>
                            <span v-else class="badge" :class="getRoleBadgeClass(user.role)">
                                {{ user.role }}
                            </span>
                        </td>
                        <td>
                            <span class="status" :class="user.is_active ? 'status-active' : 'status-inactive'">
                                {{ user.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td>{{ formatDateTime(user.last_login_at) }}</td>
                        <td>{{ formatDateTime(user.created_at) }}</td>
                        <td>
                            <button
                                v-if="user.role !== 'super_admin' && (isSuperAdmin || user.role === 'user')"
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
    padding: var(--spacing-md);
}

h1 {
    font-family: var(--font-display);
    color: var(--color-ink);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--color-sepia-light);
}

.error-message {
    background-color: var(--color-error-bg);
    color: var(--color-error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-error);
    margin-bottom: var(--spacing-md);
    text-align: center;
    font-family: var(--font-body);
}

.loading {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-ink-muted);
    font-family: var(--font-body);
    font-style: italic;
}

.empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-ink-muted);
    background-color: var(--color-paper-light);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    border: 1px solid var(--color-paper-dark);
}

.users-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-paper-light);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    font-family: var(--font-body);
}

.users-table th,
.users-table td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--color-paper-dark);
}

.users-table th {
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.8rem;
    background-color: var(--color-ink);
    color: var(--color-paper);
    border-bottom: 3px double var(--color-gold);
}

.users-table tbody tr:hover {
    background-color: var(--color-paper);
}

.inactive-row {
    background-color: var(--color-paper-dark);
    color: var(--color-ink-muted);
}

.badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge-super-admin {
    background-color: var(--color-accent);
    color: var(--color-paper);
}

.badge-admin {
    background-color: var(--color-gold);
    color: var(--color-paper);
}

.badge-user {
    background-color: var(--color-sepia);
    color: var(--color-paper);
}

.role-select {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    border: none;
    appearance: auto;
}

.role-select.badge-admin {
    background-color: var(--color-gold);
    color: var(--color-paper);
}

.role-select.badge-user {
    background-color: var(--color-sepia);
    color: var(--color-paper);
}

.role-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.status {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    font-family: var(--font-body);
}

.status-active {
    background-color: var(--color-success-bg);
    color: var(--color-success);
}

.status-inactive {
    background-color: var(--color-error-bg);
    color: var(--color-error);
}

button {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 2px solid;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-disable {
    background-color: var(--color-error);
    color: var(--color-paper);
    border-color: var(--color-error);
}

.btn-disable:hover:not(:disabled) {
    background-color: transparent;
    color: var(--color-error);
}

.btn-enable {
    background-color: var(--color-success);
    color: var(--color-paper);
    border-color: var(--color-success);
}

.btn-enable:hover:not(:disabled) {
    background-color: transparent;
    color: var(--color-success);
}

.no-action {
    color: var(--color-sepia-light);
}

.table-footer {
    margin-top: var(--spacing-md);
    text-align: right;
    color: var(--color-ink-muted);
    font-size: 0.9rem;
    font-family: var(--font-body);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .users-container {
        padding: var(--spacing-sm);
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: var(--spacing-md);
    }

    .users-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .users-table th,
    .users-table td {
        padding: var(--spacing-sm);
        font-size: 0.75rem;
        white-space: nowrap;
    }

    .badge,
    .role-select {
        font-size: 0.6rem;
        padding: 2px 4px;
    }

    .status {
        font-size: 0.65rem;
        padding: 2px 4px;
    }

    button {
        font-size: 0.65rem;
        padding: 4px 8px;
    }

    .table-footer {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .users-table th:nth-child(6),
    .users-table td:nth-child(6),
    .users-table th:nth-child(7),
    .users-table td:nth-child(7) {
        display: none;
    }
}
</style>
