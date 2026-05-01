import { useState } from "react";
import axios from "axios";
import { useAuth } from "../components/isLoggedIn";
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

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
            await api.get('/sanctum/csrf-cookie');
            await api.post(`/api/auth/login`, formData);

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