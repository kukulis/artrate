import apiClient from './api'

class AuthenticationHandler {
    async login(email: string, password: string) {
        const response = await apiClient.post('/auth/login', {
            email: email,
            password: password
        })

        this.postLoginActions(response.data)

        return response.data.user
    }

    async logout() {
        this.setAccessToken(null)
        this.setUser(null)
        await apiClient.post('/auth/logout', {
            refreshToken: this.getRefreshToken()
        })

        this.setRefreshToken(null)
    }

    async register(email:string, name:string, password: string, captchaToken: string ) {
        console.log("TODO AuthenticationHandler.register ")

        const response = await apiClient.post('/auth/register', {
            email: email,
            name: name,
            password: password,
            captchaToken: captchaToken,
        })



        return response.data
    }

    postLoginActions(data: any) {
        if (data.user) {
            this.setUser(data.user)
        }

        if (!data.accessToken || !data.refreshToken) {
            throw new Error('the login response does not contain refresh or access token')
        }
        this.setAccessToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)
    }

    setAccessToken(accessToken: string) {
        localStorage.setItem('accessToken', accessToken)
    }

    setRefreshToken(refreshToken: string) {
        localStorage.setItem('refreshToken', refreshToken)
    }

    // TODO create type user
    setUser(user: any) {
        if (user == null) {
            localStorage.setItem('user', null)
        }
        localStorage.setItem('user', JSON.stringify(user))
    }

    getAccessToken(): string {
        return localStorage.getItem('accessToken')
    }

    getRefreshToken(): string {
        return localStorage.getItem('refreshToken')
    }

    getUser(): any {
        const userStr = localStorage.getItem('user')
        console.log('AuthenticationHandler.getUser, userStr', userStr)
        if (userStr == null) {
            return null;
        }
        try {
            return JSON.parse(userStr)
        } catch (error) {
            console.log('error parsing user str', error)
            return null
        }
    }
}

export default new AuthenticationHandler()