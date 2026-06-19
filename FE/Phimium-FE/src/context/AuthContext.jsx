import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const extractAuthData = (loginResponse) => {
    const payload = loginResponse?.data ?? loginResponse;

    return {
        token: payload?.token ?? payload?.accessToken ?? payload?.jwt ?? '',
        username: payload?.username ?? payload?.name ?? payload?.email ?? '',
        role: payload?.role ?? payload?.authorities?.[0] ?? ''
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const sessionAuthKey = 'phimium_auth_session';

    // Khi F5 reload web, khôi phục lại trạng thái từ localStorage
    useEffect(() => {
        const hasActiveSession = sessionStorage.getItem(sessionAuthKey) === 'true';
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (hasActiveSession && token && token !== 'undefined' && token !== 'null' && storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem(sessionAuthKey);
        }
    }, []);

    // Hàm gọi khi đăng nhập thành công
    const handleLoginSuccess = (loginResponse) => {
        const authData = extractAuthData(loginResponse);

        if (authData.token && authData.token !== 'undefined' && authData.token !== 'null') {
            localStorage.setItem('token', authData.token);
        } else {
            localStorage.removeItem('token');
        }

        sessionStorage.setItem(sessionAuthKey, 'true');

        // Lưu lại username và role
        const userInfo = {
            username: authData.username,
            role: authData.role
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem(sessionAuthKey);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login: handleLoginSuccess, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};