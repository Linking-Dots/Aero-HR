export default function initCsrf(app) {
    // Create an axios instance if not already available
    if (!window.axios) {
        window.axios = require('axios')
    }

    // Add CSRF token to axios headers
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.withCredentials = true

    // Create a store for CSRF token
    const csrfStore = {
        token: null,
        updateToken() {
            this.token = document.head.querySelector('meta[name="csrf-token"]')?.content
            axios.defaults.headers.common['X-CSRF-TOKEN'] = this.token
        }
    }

    // Initialize CSRF token
    csrfStore.updateToken()

    // Refresh CSRF token on every response
    axios.interceptors.response.use(
        response => {
            const csrfToken = response.headers['x-csrf-token']
            if (csrfToken) {
                csrfStore.token = csrfToken
                axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken
                document.head.querySelector('meta[name="csrf-token"]').content = csrfToken
            }
            return response
        },
        error => {
            if (error.response?.status === 419) {
                // Automatically refresh CSRF token and retry request
                csrfStore.updateToken()
                return axios(error.config)
            }
            return Promise.reject(error)
        }
    )

    // Add CSRF token refresh to app
    app.config.globalProperties.$csrf = {
        updateToken: () => csrfStore.updateToken(),
        getToken: () => csrfStore.token
    }
}
