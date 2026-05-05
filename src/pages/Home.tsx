import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import { statsApi } from '../api/statsApi';
import { LayoutDashboard, FileText, Users, Image } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    sites_count: 0,
    pages_count: 0,
    users_count: 0,
    media_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Sites', value: stats.sites_count, icon: LayoutDashboard, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Total Pages', value: stats.pages_count, icon: FileText, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Total Users', value: stats.users_count, icon: Users, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { title: 'Media Files', value: stats.media_count, icon: Image, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  ];

  return (
    <>
      <main>
        <HeroSection />
        <FeatureSection />
        
        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon size={24} className="text-white" />
                      </div>
                    </div>
                    <p className={`text-4xl font-bold ${stat.textColor}`}>
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;