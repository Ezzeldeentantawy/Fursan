import { useState } from "react";
import axios from "axios";
import { useAuth } from "../components/isLoggedIn";
import CTASection from "../components/CTASection";
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { user } = useAuth();
    if (user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-white px-4">
                <div className="max-w-md w-full bg-[#E8F4FE] border border-[#2A69C6]/20 rounded-[30px] p-10 text-center shadow-lg">
                    {/* User Avatar Circle */}
                    <div className="w-20 h-20 bg-[#2A69C6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                        <span className="text-white text-3xl font-bold font-['Roboto']">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    <h2 className="font-['Roboto'] font-bold text-2xl text-[#0D47A1] mb-2">
                        Welcome Back!
                    </h2>

                    <p className="font-['Roboto'] text-lg text-black/70 mb-8">
                        You are already logged in as <span className="font-semibold text-[#2A69C6]">{user.name}</span>.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-[#2A69C6] text-white py-3 rounded-xl font-['Roboto'] font-medium transition-transform hover:scale-[1.02] active:scale-95 shadow-md"
                        >
                            Go to Home page
                        </button>

                        <button
                            onClick={() => {/* add logout logic here */ }}
                            className="w-full bg-transparent border border-[#2A69C6] text-[#2A69C6] py-3 rounded-xl font-['Roboto'] font-medium hover:bg-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = {
            name,
            email,
            password,
            password_confirmation: confirmPassword
        };

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post(`/api/auth/register/candidate`, formData);

        } catch (error: any) {
            console.error("Registration failed:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <section className="relative py-24 overflow-hidden bg-white">
                <div className="max-w-[1300px] mx-auto px-4 mt-[150px] flex flex-wrap items-center">

                    {/* Login Card Section */}
                    <div className="w-full lg:w-1/2 relative z-10">
                        {/* Decorative Rectangle - Equivalent to ::before */}
                        <div className="absolute -top-[120px] -left-[50px] -z-10 hidden md:block">
                            <img src="/Rectangle (5).svg" alt="" />
                        </div>

                        <div className="bg-[#BBDEFB5C] rounded-[47px] p-[60px_40px] max-w-[524px] ml-0 lg:ml-[50px]">
                            <h3 className="font-['Roboto'] font-medium text-[35px] leading-[42px] capitalize text-black/85 mb-5">
                                Register
                            </h3>

                            <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}

                                    className="w-full border border-[#2A69C6] p-[12px_10px] rounded-[10px] bg-transparent focus:outline-none placeholder:text-black/70 placeholder:font-['Roboto'] placeholder:text-base placeholder:capitalize"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-[#2A69C6] p-[12px_10px] rounded-[10px] bg-transparent focus:outline-none placeholder:text-black/70 placeholder:font-['Roboto']"
                                />
                                <input
                                    type="password"
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-[#2A69C6] p-[12px_10px] rounded-[10px] bg-transparent focus:outline-none placeholder:text-black/70 placeholder:font-['Roboto']"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-[#2A69C6] p-[12px_10px] rounded-[10px] bg-transparent focus:outline-none placeholder:text-black/70 placeholder:font-['Roboto']"
                                />
                                <input
                                    type="submit"
                                    value="Register"
                                    className="w-full bg-[#2A69C6] border border-[#2A69C6] p-[12px_10px] rounded-[10px] font-['Roboto'] font-medium text-xl text-white capitalize cursor-pointer transition-opacity hover:opacity-90 mt-4 mb-[30px]"
                                />
                            </form>

                            <p className="font-['Roboto'] font-normal text-xl text-center capitalize text-black/85 mt-[15px]">
                                already have an account ? <a href="#" className="text-[#2A69C6] no-underline inline hover:underline">Login</a>
                            </p>
                        </div>
                    </div>

                    {/* Hero Image Section */}
                    <div className="w-full lg:w-1/2 text-right mt-12 lg:mt-0">
                        <img
                            src="/Signup.webp"
                            alt="Sign up illustration"
                            className="w-full max-w-[524px] inline-block"
                        />
                    </div>

                </div>
            </section>
            <CTASection />
        </>

        // <form className="register-form" onSubmit={handleSubmit}>
        //     <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        //     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        //     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        //     <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        //     <button type="submit">Register</button>
        // </form>
    );
}

export default Register;