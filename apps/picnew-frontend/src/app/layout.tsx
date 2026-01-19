'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
