// Auth utilities
const AUTH_TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Obtener tipo de token
function getTokenType() {
    return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    return !!getToken();
}

// Guardar token en localStorage
function saveToken(access_token, token_type = 'Bearer') {
    localStorage.setItem(AUTH_TOKEN_KEY, access_token);
    localStorage.setItem(TOKEN_TYPE_KEY, token_type);
}

// Eliminar token
function removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
}

// Logout
function logout() {
    removeToken();
    window.location.href = '/login';
}

// Páginas públicas (no requieren autenticación)
const PUBLIC_PAGES = ['/login', '/register', '/'];

// Verificar si la página actual es pública
function isPublicPage() {
    const path = window.location.pathname;
    return PUBLIC_PAGES.some(page => path === page || path.startsWith(page + '?'));
}

// Redirigir a login si no está autenticado en páginas protegidas
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
    
    // No agregar token a peticiones de autenticación (registro)
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
        // Si recibimos 401 (Unauthorized), el token expiró
        if (response.status === 401) {
            removeToken();
            // Redirigir a login solo si no estamos ya en login/register
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login?expired=true';
            }
        }
        return response;
    });
};

// Función para obtener perfil del usuario actual
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

// Mostrar/ocultar botón de logout en navbar
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

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
    checkAuthOnPageLoad();
    setupAuthUI();
});
