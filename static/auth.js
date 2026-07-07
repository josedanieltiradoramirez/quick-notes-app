// Auth utilities
const AUTH_TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

// Get token from localStorage
function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Get token type
function getTokenType() {
    return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Save token in localStorage
function saveToken(access_token, token_type = 'Bearer') {
    localStorage.setItem(AUTH_TOKEN_KEY, access_token);
    localStorage.setItem(TOKEN_TYPE_KEY, token_type);
}

// Remove token
function removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
}

// Logout
function logout() {
    removeToken();
    window.location.href = '/login';
}

// Public pages (do not require authentication)
const PUBLIC_PAGES = ['/login', '/register', '/'];

// Check if the current page is public
function isPublicPage() {
    const path = window.location.pathname;
    return PUBLIC_PAGES.some(page => path === page || path.startsWith(page + '?'));
}

// Redirect to login if not authenticated on protected pages
function checkAuthOnPageLoad() {
    if (!isPublicPage() && !isAuthenticated()) {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
    }
}

// Interceptor para fetch - agrega token automáticamente
const originalFetch = window.fetch;

window.fetch = function(...args) {
    const url = args[0];

    // Garantizar que exista el objeto options
    args[1] = args[1] || {};
    const options = args[1];
    
    // Do not add token to authentication requests (registration)
    if (typeof url === 'string' && url.includes('/api/auth/') && options.method === 'POST' && !url.includes('/token')) {
        return originalFetch.apply(this, args);
    }
    
    // Agregar token a peticiones de API
    if (typeof url === 'string' && url.includes('/api/')) {
        const token = getToken();
        if (token) {
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['Authorization'] = `${getTokenType()} ${token}`;
        }
    }
    
    return originalFetch.apply(this, args).then(response => {
        // If we receive 401 (Unauthorized), the token expired
        if (response.status === 401) {
            removeToken();
            // Redirect to login only if we are not already on login/register
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login?expired=true';
            }
        }
        return response;
    });
};

// Function to get the current user's profile
async function getCurrentUser() {
    try {
        const response = await fetch('/api/user/', {
            method: 'GET'
        });
        
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Show/hide logout button in the navbar
function setupAuthUI() {
    const token = getToken();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.addEventListener('click', logout);
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthOnPageLoad();
    setupAuthUI();
});
