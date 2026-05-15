import {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    ReactNode
} from "react";
import { authApi } from '../api/auth';

// 1. Define strict types instead of 'any'
interface User {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'site_admin';
    site_id: number | null;
    // add other fields your API returns
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (userData: User, token?: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Wrap the check in useCallback so it's stable
    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            // First check for an auth token in localStorage
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
                // No token means not authenticated
                console.log('[AuthContext] No auth token found, not authenticated');
                setUser(null);
                localStorage.removeItem('user');
                setError(null);
                setLoading(false);
                return;
            }
            
            // Token exists, verify it with the API
            console.log('[AuthContext] Auth token found, verifying with API...');
            const user = await authApi.checkAuth();
            
            if (user && user.role) {
                console.log('[AuthContext] Token verified, user authenticated:', user);
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                setError(null);
            } else {
                // API returned but no valid user data
                console.warn('[AuthContext] API returned invalid user data');
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
            }
        } catch (err: any) {
            console.error('[AuthContext] Auth check failed:', err);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            
            if (err.response?.status !== 401) {
                setError("Failed to fetch user session");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData: User, token?: string) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('auth_token', token);
        }
    };

    const updateProfile = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        } catch (err) {
            console.error("Logout failed", err);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // 3. Memoize the context value
    // This prevents all consumers from re-rendering unless user/loading actually changes
    const value = useMemo(() => ({
        user,
        loading,
        error,
        login,
        logout,
        refreshUser: checkAuth,
        updateProfile,
    }), [user, loading, error, checkAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Improved Hook with error handling
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};