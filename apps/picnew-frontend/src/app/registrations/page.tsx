'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useDataStore } from '@/store/data';
import { apiClient } from '@/lib/api';

export default function RegistrationsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchRegistrations = useDataStore((state) => state.fetchRegistrations);
  const registrations = useDataStore((state) => state.registrations);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const status = filter === 'all' ? undefined : filter.toUpperCase();
        await fetchRegistrations(undefined, status);
        const linksRes = await apiClient.getLinks(1, 100);
        setLinks(linksRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router, filter, fetchRegistrations]);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      await apiClient.approveRegistration(id);
      const updatedStatus = filter === 'all' ? undefined : filter.toUpperCase();
      await fetchRegistrations(undefined, updatedStatus);
      setSelectedId(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await apiClient.rejectRegistration(id, rejectReason);
      const updatedStatus = filter === 'all' ? undefined : filter.toUpperCase();
      await fetchRegistrations(undefined, updatedStatus);
      setSelectedId(null);
      setRejectReason('');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;

  const statusBadgeColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back
            </button>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Registrations</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No registrations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {reg.participant?.name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {reg.participant?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {reg.link?.trainingProgram?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          statusBadgeColor[reg.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {reg.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedId(reg.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Review Registration</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Decision</label>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleApprove(selectedId)}
                    disabled={processing}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setRejectReason('') || setSelectedId(null)}
                    disabled={processing}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rejection Reason (if rejecting)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                  placeholder="Leave empty to approve"
                />
                {rejectReason && (
                  <button
                    onClick={() => handleReject(selectedId)}
                    disabled={processing}
                    className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
