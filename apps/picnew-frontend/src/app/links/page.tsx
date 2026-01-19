'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useDataStore } from '@/store/data';
import { apiClient } from '@/lib/api';

export default function LinksPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchLinks = useDataStore((state) => state.fetchLinks);
  const links = useDataStore((state) => state.links);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    trainingProgramId: '',
    maxRegistrations: '',
    expiredAt: '',
  });
  const [programs, setPrograms] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        await fetchLinks();
        const masterData = await apiClient.getMasterData();
        setPrograms(masterData.data.trainingPrograms);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router, fetchLinks]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.createLink(
        formData.trainingProgramId,
        formData.maxRegistrations ? parseInt(formData.maxRegistrations) : undefined,
        formData.expiredAt || undefined
      );
      setShowModal(false);
      setFormData({ trainingProgramId: '', maxRegistrations: '', expiredAt: '' });
      await fetchLinks();
    } catch (error) {
      console.error('Failed to create link:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

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
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Registration Links</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Create Link
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : links.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No registration links created yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create your first link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Registrations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {links.map((link: any) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono">
                        {link.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {link.trainingProgram?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          link.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {link.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {link._count?.registrations || 0} / {link.maxRegistrations || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Create Registration Link</h2>
            <form onSubmit={handleCreateLink} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Training Program *
                </label>
                <select
                  value={formData.trainingProgramId}
                  onChange={(e) =>
                    setFormData({ ...formData, trainingProgramId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select a program...</option>
                  {programs.map((prog: any) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Registrations
                </label>
                <input
                  type="number"
                  value={formData.maxRegistrations}
                  onChange={(e) =>
                    setFormData({ ...formData, maxRegistrations: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiredAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiredAt: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
