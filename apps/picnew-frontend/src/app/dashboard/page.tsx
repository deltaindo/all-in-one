'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useDataStore } from '@/store/data';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const fetchMasterData = useDataStore((state) => state.fetchMasterData);
  const masterData = useDataStore((state) => state.masterData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      await fetchMasterData();
      setLoading(false);
    };
    load();
  }, [user, router, fetchMasterData]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Bidangs',
      value: masterData?.bidangs?.length || 0,
      color: 'blue',
    },
    {
      label: 'Training Programs',
      value: masterData?.trainingPrograms?.length || 0,
      color: 'green',
    },
    {
      label: 'Training Classes',
      value: masterData?.trainingClasses?.length || 0,
      color: 'purple',
    },
    {
      label: 'Personnel Types',
      value: masterData?.personnelTypes?.length || 0,
      color: 'orange',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  const menuItems = [
    { label: 'Registration Links', href: '/links', icon: '🔗' },
    { label: 'Registrations', href: '/registrations', icon: '📝' },
    { label: 'Training Programs', href: '/training', icon: '📚' },
    { label: 'Master Data', href: '/master-data', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PICNew Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">K3 Training Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Role: {user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg p-6 ${colorMap[stat.color as keyof typeof colorMap]}`}
            >
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-2 font-medium text-gray-900">{item.label}</h3>
                <p className="mt-1 text-sm text-gray-600">Manage {item.label.toLowerCase()}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
