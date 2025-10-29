// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('index.html')) {
        window.location.href = 'home.html';
    }
});

// Show Login Form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    clearMessage();
}

// Show Register Form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    clearMessage();
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showMessage('Logging in...', 'success');

        const response = await api.login(email, password);

        if (response.success) {
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        }
    } catch (error) {
        showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        showMessage('Registering...', 'success');

        const response = await api.register(username, email, password);

        if (response.success) {
            showMessage('Registration successful! Please login.', 'success');

            // Clear form
            document.getElementById('registerUsername').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';

            // Switch to login form
            setTimeout(() => {
                showLogin();
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    }
}

// Show Message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

// Clear Message
function clearMessage() {
    const messageEl = document.getElementById('message');
    messageEl.textContent = '';
    messageEl.className = 'message';
    messageEl.style.display = 'none';
}
