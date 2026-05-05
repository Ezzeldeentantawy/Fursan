import { useState } from "react";
import { useAuth } from "../components/isLoggedIn";
import { authApi } from "../api/auth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user, login: authLogin } = useAuth();
    
    if (user) {
        return <p>You are already logged in as {user.name}.</p>;
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authApi.login(email, password);
            
            console.log('[Login] Full response:', response);
            
            // auth.js login() returns res.data, which is: { message, user, redirect }
            // The user field is a UserResource: { data: { user object } }
            
            let userData = null;
            
            // Extract user data from the response
            if (response?.user?.data) {
                // Structure: response.user.data = { id, name, email, role, ... }
                userData = response.user.data;
            } else if (response?.user) {
                userData = response.user;
            } else if (response?.data) {
                userData = response.data;
            } else {
                userData = response;
            }
            
            console.log('[Login] Extracted user data:', userData);
            
            if (userData && userData.role) {
                // Use the auth context's login function to store user data
                // This ensures AuthContext and localStorage are both updated
                authLogin(userData);
                
                console.log('[Login] Called authLogin with:', userData);
                
                // Redirect based on role
                if (userData.role === 'super_admin') {
                    console.log('[Login] Redirecting to /admin (super_admin)');
                    window.location.href = '/admin';
                } else {
                    console.log('[Login] Redirecting to /admin/site (site_admin)');
                    window.location.href = '/admin/site';
                }
            } else {
                console.error('[Login] Invalid user data structure:', response);
                setError('Login succeeded but received invalid user data. Please try again.');
                window.location.reload();
            }
        } catch (error: any) {
            console.error("[Login] Login failed:", error);
            console.error("[Login] Error response:", error.response?.data);
            setError(error.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Fursan CMS Login
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login