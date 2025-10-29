// API Configuration
const API_BASE_URL = 'http://34.31.148.75:5000/api';

// API Service
class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Get headers with or without token
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request handler
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(options.auth),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth Endpoints
    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getProfile() {
        return this.request('/auth/profile', {
            method: 'GET',
            auth: true
        });
    }

    // Post Endpoints
    async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            auth: true,
            body: JSON.stringify(postData)
        });
    }

    async getPosts(filters = {}) {
        const queryParams = new URLSearchParams();

        if (filters.topic && filters.topic !== 'All') {
            queryParams.append('topic', filters.topic);
        }

        if (filters.status) {
            queryParams.append('status', filters.status);
        }

        const queryString = queryParams.toString();
        const endpoint = `/posts${queryString ? '?' + queryString : ''}`;

        return this.request(endpoint, {
            method: 'GET'
        });
    }

    async getPost(postId) {
        return this.request(`/posts/${postId}`, {
            method: 'GET'
        });
    }

    async likePost(postId) {
        return this.request(`/posts/${postId}/like`, {
            method: 'POST',
            auth: true
        });
    }

    async dislikePost(postId) {
        return this.request(`/posts/${postId}/dislike`, {
            method: 'POST',
            auth: true
        });
    }

    async addComment(postId, text) {
        return this.request(`/posts/${postId}/comment`, {
            method: 'POST',
            auth: true,
            body: JSON.stringify({ text })
        });
    }

    async getMostActivePost(topic) {
        return this.request(`/posts/most-active/${topic}`, {
            method: 'GET'
        });
    }

    async getExpiredPosts(topic) {
        return this.request(`/posts/expired/${topic}`, {
            method: 'GET'
        });
    }

    async getMyInteractions() {
        return this.request('/posts/interactions/my-history', {
            method: 'GET',
            auth: true
        });
    }

    async getPostInteractions(postId) {
        return this.request(`/posts/${postId}/interactions`, {
            method: 'GET'
        });
    }
}

// Create global API instance
const api = new ApiService();
