import { useState } from "react";
import { useAuth } from "../components/isLoggedIn";
import { authApi } from "../api/auth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { user } = useAuth();
    
    if (user) {
        return <p>You are already logged in as {user.name}.</p>;
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            email,
            password,
        };

        try {
            await authApi.login(formData.email, formData.password);
            // Optionally refresh the auth context or redirect
            window.location.reload();
        } catch (error: any) {
            console.error("Login failed:", error.response?.data || error.message);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login