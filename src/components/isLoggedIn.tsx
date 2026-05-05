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
    login: (userData: User) => void;
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
            // First check localStorage for user data (set during login)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    // Validate user data has required fields
                    if (userData && userData.role) {
                        console.log('[AuthContext] Loaded user from localStorage:', userData);
                        setUser(userData);
                        setLoading(false);
                        return;
                    } else {
                        console.warn('[AuthContext] Invalid user data in localStorage, removing...');
                        localStorage.removeItem('user');
                    }
                } catch (parseErr) {
                    console.error('[AuthContext] Failed to parse user data:', parseErr);
                    localStorage.removeItem('user');
                }
            }
            
            // Otherwise check with API
            console.log('[AuthContext] No valid user in localStorage, checking API...');
            const user = await authApi.checkAuth();
            if (user && user.role) {
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                setUser(null);
            }
            setError(null);
        } catch (err: any) {
            setUser(null);
            // Only set error if it's not a simple 401 (unauthorized)
            if (err.response?.status !== 401) {
                setError("Failed to fetch user session");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
        } catch (err) {
            console.error("Logout failed", err);
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