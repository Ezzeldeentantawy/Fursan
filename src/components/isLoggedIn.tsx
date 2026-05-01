import {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    ReactNode
} from "react";
import axios from "axios";

// 1. Define strict types instead of 'any'
interface User {
    id: string;
    email: string;
    name: string;
    // add other fields your API returns
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_API_URL}`,
        withCredentials: true,
        withXSRFToken: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });



    // 2. Wrap the check in useCallback so it's stable
    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<User>(`/api/user`);
            setUser(res.data);
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

    const login = (userData: User) => setUser(userData);

    const logout = async () => {
        try {
            await axios.post("/api/logout");
            setUser(null);
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
        refreshUser: checkAuth
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