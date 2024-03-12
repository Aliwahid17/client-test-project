const ROOTS = {
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
    API: '/api',
};

export const routes = {
    api : {
        auth : {
            logout : `${ROOTS.API}/auth/logout`,
            callback : `${ROOTS.API}/auth/callback`,
        }
    },
    auth : {
        login: `${ROOTS.AUTH}/login`,
        signup : `${ROOTS.AUTH}/signup`,
    },
    dashboard : {
        root : ROOTS.DASHBOARD,
    }
}