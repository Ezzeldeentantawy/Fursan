import React from 'react';
import { ArrowRight, Layout, Globe, Users, Image, FileText } from 'lucide-react';
import { useAuth } from './isLoggedIn';

const HeroSection = () => {
    const { user } = useAuth();
    
    const getDashboardLink = () => {
        if (!user) return '/login';
        return user.role === 'super_admin' ? '/admin' : '/admin/site';
    };
    
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full opacity-5 animate-spin" style={{ animationDuration: '30s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
                    <Layout size={16} />
                    <span>Modern Content Management System</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
                    Build Beautiful
                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                        Websites
                    </span>
                    With Ease
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up delay-200">
                    Fursan CMS empowers you to create stunning, responsive websites with our intuitive drag-and-drop builder. No coding required.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
                    <a
                        href={getDashboardLink()}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                    >
                        Get Started
                        <ArrowRight size={20} />
                    </a>
                    <a
                        href="#features"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all transform hover:scale-105"
                    >
                        Learn More
                    </a>
                </div>

                {/* Feature Icons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up delay-500">
                    {[
                        { icon: Layout, label: 'Page Builder' },
                        { icon: Globe, label: 'Multi-Site' },
                        { icon: Users, label: 'User Management' },
                        { icon: Image, label: 'Media Library' },
                    ].map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="flex flex-col items-center gap-3 text-white">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer transform hover:scale-110 transition-transform">
                                    <Icon size={28} />
                                </div>
                                <span className="text-sm font-medium">{feature.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;