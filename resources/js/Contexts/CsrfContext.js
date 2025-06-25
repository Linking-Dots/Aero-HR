import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CsrfContext = createContext(null);

export const CsrfProvider = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState(() => {
        const token = document.head.querySelector('meta[name="csrf-token"]')?.content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        return token;
    });

    useEffect(() => {
        // Update axios headers when token changes
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }, [csrfToken]);

    // Add interceptor for token refresh
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            response => {
                const newToken = response.headers['x-csrf-token'];
                if (newToken) {
                    setCsrfToken(newToken);
                    document.head.querySelector('meta[name="csrf-token"]').content = newToken;
                }
                return response;
            },
            error => {
                if (error.response?.status === 419) {
                    // Get fresh token and retry request
                    const token = document.head.querySelector('meta[name="csrf-token"]')?.content;
                    if (token) {
                        setCsrfToken(token);
                        return axios(error.config);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    return (
        <CsrfContext.Provider value={{ csrfToken, updateToken: () => {
            const token = document.head.querySelector('meta[name="csrf-token"]')?.content;
            if (token) {
                setCsrfToken(token);
            }
        } }}>
            {children}
        </CsrfContext.Provider>
    );
};

export const useCsrf = () => {
    const context = useContext(CsrfContext);
    if (context === undefined) {
        throw new Error('useCsrf must be used within a CsrfProvider');
    }
    return context;
};
