'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useDataStore } from '@/store/data';
import { apiClient } from '@/lib/api';

export default function TrainingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [programs, setPrograms] = useState<any[]>([]);
  const [bidangs, setBidangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBidang, setSelectedBidang] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationHours: '',
    bidangId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const masterData = await apiClient.getMasterData();
        setPrograms(masterData.data.trainingPrograms);
        setBidangs(masterData.data.bidangs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.createTrainingProgram({
        name: formData.name,
        description: formData.description,
        durationHours: parseInt(formData.durationHours),
        bidangId: formData.bidangId,
      });
      setShowModal(false);
      setFormData({ name: '', description: '', durationHours: '', bidangId: '' });
      // Reload programs
      const masterData = await apiClient.getMasterData();
      setPrograms(masterData.data.trainingPrograms);
    } catch (error) {
      console.error('Failed to create program:', error);
      alert('Failed to create program');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const filteredPrograms = selectedBidang
    ? programs.filter((p: any) => p.bidangId === selectedBidang)
    : programs;

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
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Training Programs</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Create Program
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Filter by Bidang */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Filter by Bidang:</label>
          <select
            value={selectedBidang}
            onChange={(e) => setSelectedBidang(e.target.value)}
            className="mt-2 rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">All Bidangs</option>
            {bidangs.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No training programs found.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create first program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program: any) => (
              <div
                key={program.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {program.bidang?.code || 'N/A'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{program.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    ⏳ {program.durationHours} hours
                  </div>
                  <div className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {program._count?.links || 0} links
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Create Training Program</h2>
            <form onSubmit={handleCreateProgram} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bidang *</label>
                <select
                  value={formData.bidangId}
                  onChange={(e) => setFormData({ ...formData, bidangId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select a bidang...</option>
                  {bidangs.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (hours) *</label>
                <input
                  type="number"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
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
