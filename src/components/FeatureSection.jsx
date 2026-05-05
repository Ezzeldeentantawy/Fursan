import React from 'react';
import { 
  Layout, 
  Globe, 
  Users, 
  Image, 
  FileText, 
  Settings,
  Shield,
  Smartphone
} from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: Layout,
      title: 'Drag & Drop Builder',
      description: 'Create stunning pages with our intuitive drag-and-drop builder. No coding required.',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Globe,
      title: 'Multi-Site Management',
      description: 'Manage multiple websites from a single dashboard. Perfect for agencies and enterprises.',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Control access with role-based permissions. Assign site admins to specific sites.',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Image,
      title: 'Media Library',
      description: 'Upload, organize, and manage all your media files with our powerful media manager.',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: FileText,
      title: 'SEO Optimized',
      description: 'Built-in SEO tools to help your websites rank higher in search engines.',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Settings,
      title: 'Flexible Configuration',
      description: 'Customize every aspect of your website with our comprehensive settings panel.',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with Sanctum authentication and CSRF protection.',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'All websites built with Fursan CMS are automatically responsive and mobile-friendly.',
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Fursan CMS?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build and manage professional websites, all in one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
