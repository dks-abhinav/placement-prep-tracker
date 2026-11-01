import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Star,
  Calendar,
  UserCheck,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  Award,
  CheckCircle,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { MockInterview, MockInterviewType } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface MockInterviewsViewProps {
  mocks: MockInterview[];
  onAddMock: (mock: Omit<MockInterview, 'id'>) => Promise<void> | void;
  onUpdateMock: (mock: MockInterview) => Promise<void> | void;
  onDeleteMock: (id: string) => Promise<void> | void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const MockInterviewsView: React.FC<MockInterviewsViewProps> = ({
  mocks,
  onAddMock,
  onUpdateMock,
  onDeleteMock,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [editingMock, setEditingMock] = useState<MockInterview | null>(null);
  const [mockToDelete, setMockToDelete] = useState<MockInterview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MockInterviewType>('DSA Round');
  const [date, setDate] = useState('2026-10-26');
  const [interviewerOrPlatform, setInterviewerOrPlatform] = useState('');
  const [rating, setRating] = useState<number>(4);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [feedback, setFeedback] = useState('');
  const [problemsAsked, setProblemsAsked] = useState('');
  const [formError, setFormError] = useState('');

  const types: MockInterviewType[] = [
    'DSA Round',
    'Core CS & System Design',
    'HR & Behavioral',
    'Full Technical Mock',
  ];

  const handleOpenAdd = () => {
    setTitle('');
    setType('DSA Round');
    setDate(new Date().toISOString().split('T')[0]);
    setInterviewerOrPlatform('');
    setRating(4);
    setStrengths('');
    setWeaknesses('');
    setFeedback('');
    setProblemsAsked('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mock: MockInterview) => {
    setEditingMock(mock);
    setTitle(mock.title);
    setType(mock.type);
    setDate(mock.date);
    setInterviewerOrPlatform(mock.interviewerOrPlatform);
    setRating(mock.rating);
    setStrengths(mock.strengths);
    setWeaknesses(mock.weaknesses);
    setFeedback(mock.feedback);
    setProblemsAsked(mock.problemsAsked);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Mock interview title is required.');
      return;
    }
    if (!interviewerOrPlatform.trim()) {
      setFormError('Interviewer or platform name is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      date,
      interviewerOrPlatform: interviewerOrPlatform.trim(),
      rating,
      strengths: strengths.trim(),
      weaknesses: weaknesses.trim(),
      feedback: feedback.trim(),
      problemsAsked: problemsAsked.trim(),
    };

    try {
      setIsSubmitting(true);
      setFormError('');
      if (editingMock) {
        await onUpdateMock({ ...payload, id: editingMock.id });
        setEditingMock(null);
      } else {
        await onAddMock(payload);
        setIsAddModalOpen(false);
      }
      setFormError('');
    } catch (err: any) {
      console.error('Failed to save mock interview to cloud:', err);
      setFormError(err?.message || 'Failed to save mock interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const totalMocks = mocks.length;
  const avgRating =
    totalMocks > 0
      ? (mocks.reduce((acc, m) => acc + m.rating, 0) / totalMocks).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Mock Interview Performance Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Log peer practice, mentor evaluations & platform mocks to overcome stage fright and improve articulation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded text-center">
              <div className="text-xs font-semibold text-purple-700">Average Rating</div>
              <div className="text-lg font-bold font-mono text-purple-900 flex items-center justify-center gap-1">
                <span>{avgRating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Record New Session
            </button>
          </div>
        </div>
      </div>

      {/* Mocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mocks.map((mock) => (
          <div
            key={mock.id}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{mock.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {mock.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {mock.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> {mock.interviewerOrPlatform}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(mock)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="Edit session"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMockToDelete(mock)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-1 my-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= mock.rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-mono font-bold text-slate-700">
                  {mock.rating}/5 Rating
                </span>
              </div>

              {/* Questions asked */}
              {mock.problemsAsked && (
                <div className="text-xs mb-2.5 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700">Questions Asked: </span>
                  <span className="text-slate-600 font-mono text-[11px]">{mock.problemsAsked}</span>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="space-y-1.5 text-xs">
                {mock.strengths && (
                  <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded text-emerald-900">
                    <strong className="text-emerald-800">Strengths: </strong>
                    {mock.strengths}
                  </div>
                )}
                {mock.weaknesses && (
                  <div className="p-2 bg-amber-50/70 border border-amber-100 rounded text-amber-900">
                    <strong className="text-amber-800">Areas to Improve: </strong>
                    {mock.weaknesses}
                  </div>
                )}
              </div>
            </div>

            {/* General Feedback Quote */}
            {mock.feedback && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs italic text-slate-600">
                "{mock.feedback}"
              </div>
            )}
          </div>
        ))}
      </div>

      {mocks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No mock interviews recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Conduct a peer mock or platform test and record your feedback here.
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingMock) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingMock ? 'Edit Mock Interview Record' : 'Record Mock Interview Session'}
                </h3>
                <p className="text-xs text-slate-500">
                  Track ratings, strengths, and actionable feedback
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isSubmitting) {
                    setIsAddModalOpen(false);
                    setEditingMock(null);
                  }
                }}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Amazon Peer Mock: Dynamic Programming & Binary Trees"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Round Type
                  </label>
                  <select
                    value={type}
                    disabled={isSubmitting}
                    onChange={(e) => setType(e.target.value as MockInterviewType)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    disabled={isSubmitting}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Interviewer / Platform *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={interviewerOrPlatform}
                    onChange={(e) => setInterviewerOrPlatform(e.target.value)}
                    placeholder="e.g. Pramp / Mentor / Senior"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Overall Rating (1 to 5)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        disabled={isSubmitting}
                        onClick={() => setRating(star)}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Questions / Problems Asked
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={problemsAsked}
                  onChange={(e) => setProblemsAsked(e.target.value)}
                  placeholder="e.g. LRU Cache & Course Schedule cycle detection"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Key Strengths Observed
                  </label>
                  <textarea
                    rows={2}
                    disabled={isSubmitting}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Clear communication, optimal time complexity analysis..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    Areas of Improvement
                  </label>
                  <textarea
                    rows={2}
                    disabled={isSubmitting}
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    placeholder="Edge cases testing, took time formulating recursive base case..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Overall Mentor Feedback / Notes
                </label>
                <textarea
                  rows={2}
                  disabled={isSubmitting}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="High confidence, keep doing mock tests weekly before Day 0..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMock(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? 'Saving Session...' : editingMock ? 'Update Session' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(mockToDelete)}
        title="Delete Mock Interview Record"
        message={`Are you sure you want to delete "${mockToDelete?.title}"?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive={true}
        onCancel={() => !isDeleting && setMockToDelete(null)}
        onConfirm={async () => {
          if (mockToDelete) {
            try {
              setIsDeleting(true);
              await onDeleteMock(mockToDelete.id);
              setMockToDelete(null);
            } catch (err) {
              console.error('Failed to delete mock interview:', err);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
      />
    </div>
  );
};
