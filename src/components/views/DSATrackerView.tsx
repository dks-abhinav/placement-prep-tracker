import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  ExternalLink,
  RotateCw,
  FileText,
  Trash2,
  Filter,
  X,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { DSAProblem, DSADifficulty, DSAPlatform } from '../../types';
import { DifficultyBadge } from '../common/Badge';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface DSATrackerViewProps {
  problems: DSAProblem[];
  onToggleSolved: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onIncrementRevision: (id: string) => void;
  onAddProblem: (problem: Omit<DSAProblem, 'id'>) => Promise<void> | void;
  onUpdateNotes: (id: string, notes: string) => Promise<void> | void;
  onDeleteProblem: (id: string) => Promise<void> | void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onLoadTemplates?: () => Promise<void> | void;
}

export const DSATrackerView: React.FC<DSATrackerViewProps> = ({
  problems,
  onToggleSolved,
  onToggleBookmark,
  onIncrementRevision,
  onAddProblem,
  onUpdateNotes,
  onDeleteProblem,
  isAddModalOpen,
  setIsAddModalOpen,
  onLoadTemplates,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | DSADifficulty>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved' | 'Bookmarked'>('All');

  // Notes Modal state
  const [activeNotesProblem, setActiveNotesProblem] = useState<DSAProblem | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  // Delete modal state
  const [problemToDelete, setProblemToDelete] = useState<DSAProblem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Form state for adding custom problem
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newTopic, setNewTopic] = useState('Arrays & Hashing');
  const [newDifficulty, setNewDifficulty] = useState<DSADifficulty>('Medium');
  const [newPlatform, setNewPlatform] = useState<DSAPlatform>('LeetCode');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTags, setNewTags] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => set.add(p.topic));
    return ['All', ...Array.from(set).sort()];
  }, [problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        problem.title.toLowerCase().includes(search) ||
        problem.code.toLowerCase().includes(search) ||
        problem.topic.toLowerCase().includes(search) ||
        problem.tags.some((t) => t.toLowerCase().includes(search));

      // Topic
      const matchesTopic = selectedTopic === 'All' || problem.topic === selectedTopic;

      // Difficulty
      const matchesDifficulty =
        selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;

      // Status
      let matchesStatus = true;
      if (selectedStatus === 'Solved') matchesStatus = problem.solved;
      if (selectedStatus === 'Unsolved') matchesStatus = !problem.solved;
      if (selectedStatus === 'Bookmarked') matchesStatus = problem.bookmarked;

      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchTerm, selectedTopic, selectedDifficulty, selectedStatus]);

  // Stats
  const solvedCount = problems.filter((p) => p.solved).length;
  const bookmarkedCount = problems.filter((p) => p.bookmarked).length;

  const handleOpenNotes = (problem: DSAProblem) => {
    setActiveNotesProblem(problem);
    setNotesDraft(problem.notes || '');
    setNotesError('');
  };

  const handleSaveNotes = async () => {
    if (!activeNotesProblem || isSavingNotes) return;
    try {
      setIsSavingNotes(true);
      setNotesError('');
      await onUpdateNotes(activeNotesProblem.id, notesDraft);
      setActiveNotesProblem(null);
    } catch (err: any) {
      console.error('Failed to save notes:', err);
      setNotesError(err?.message || 'Failed to save notes. Please try again.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Problem title is required.');
      return;
    }

    const autoCode = newCode.trim() || `PROB-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedTags = newTags
      ? newTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [newTopic];

    try {
      setIsSubmitting(true);
      setFormError('');
      await onAddProblem({
        code: autoCode,
        title: newTitle.trim(),
        topic: newTopic,
        difficulty: newDifficulty,
        solved: false,
        bookmarked: false,
        revisionsCount: 0,
        platform: newPlatform,
        problemUrl: newUrl.trim() || 'https://leetcode.com',
        notes: newNotes.trim(),
        tags: parsedTags,
      });

      // Reset form and close modal only after successful persistence
      setNewTitle('');
      setNewCode('');
      setNewNotes('');
      setNewUrl('');
      setNewTags('');
      setFormError('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save DSA problem to cloud:', err);
      setFormError(err?.message || 'Failed to save problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadTemplatesClick = async () => {
    if (!onLoadTemplates || isLoadingTemplates) return;
    try {
      setIsLoadingTemplates(true);
      await onLoadTemplates();
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by problem name, LC code (e.g. LC-0042), topic or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Problem
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
            {(['All', 'Solved', 'Unsolved', 'Bookmarked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
                {status === 'Solved' && ` (${solvedCount})`}
                {status === 'Bookmarked' && ` (${bookmarkedCount})`}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown / Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Topic Select */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-600 outline-none"
            >
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Table View */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Showing {filteredProblems.length} of {problems.length} problems</span>
          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {solvedCount} Solved ({problems.length ? Math.round((solvedCount / problems.length) * 100) : 0}%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 w-10 text-center">Status</th>
                <th className="py-2.5 px-3 w-24">ID</th>
                <th className="py-2.5 px-3">Problem Title</th>
                <th className="py-2.5 px-3 w-36">Topic</th>
                <th className="py-2.5 px-3 w-20">Difficulty</th>
                <th className="py-2.5 px-3 w-24 text-center">Revisions</th>
                <th className="py-2.5 px-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProblems.map((problem) => (
                <tr
                  key={problem.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    problem.solved ? 'bg-slate-50/30' : ''
                  }`}
                >
                  {/* Solved Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onToggleSolved(problem.id)}
                      title={problem.solved ? 'Mark unsolved' : 'Mark solved'}
                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                    >
                      {problem.solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                  </td>

                  {/* Code */}
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 text-[11px]">
                    {problem.code}
                  </td>

                  {/* Title & Tags */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold ${
                          problem.solved ? 'text-slate-700 line-through decoration-slate-300' : 'text-slate-900'
                        }`}
                      >
                        {problem.title}
                      </span>
                      {problem.problemUrl && (
                        <a
                          href={problem.problemUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open on ${problem.platform}`}
                          className="text-slate-400 hover:text-blue-600 inline-flex items-center p-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Topic */}
                  <td className="py-2.5 px-3 text-slate-600 text-xs truncate">
                    {problem.topic}
                  </td>

                  {/* Difficulty */}
                  <td className="py-2.5 px-3">
                    <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                  </td>

                  {/* Revision Count with increment */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 bg-slate-100/90 rounded px-1.5 py-0.5">
                      <span className="font-mono font-semibold text-slate-700 text-[11px]">
                        {problem.revisionsCount}x
                      </span>
                      <button
                        onClick={() => onIncrementRevision(problem.id)}
                        title="Increment revision count (+1)"
                        className="text-slate-500 hover:text-blue-600 p-0.5"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Bookmark toggle */}
                      <button
                        onClick={() => onToggleBookmark(problem.id)}
                        title={problem.bookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
                        className={`p-1.5 rounded transition-colors ${
                          problem.bookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                        }`}
                      >
                        {problem.bookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Notes button */}
                      <button
                        onClick={() => handleOpenNotes(problem)}
                        title="View / Edit approach notes"
                        className={`p-1.5 rounded transition-colors ${
                          problem.notes
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setProblemToDelete(problem)}
                        title="Delete problem"
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {filteredProblems.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {problems.length === 0 ? 'Your DSA Problem Tracker is Empty' : 'No matching DSA problems found'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {problems.length === 0
                  ? 'Start by creating your own practice problems or import standard campus placement SDE questions.'
                  : 'Try adjusting your search query, difficulty, or topic filter.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {problems.length === 0 ? (
                  <>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs text-white font-semibold bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      + Add First Problem
                    </button>
                    {onLoadTemplates && (
                      <button
                        onClick={handleLoadTemplatesClick}
                        disabled={isLoadingTemplates}
                        className="px-3.5 py-1.5 text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isLoadingTemplates && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                        {isLoadingTemplates ? 'Importing SDE Templates...' : 'Load Standard SDE Sheet Template (20 Questions)'}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTopic('All');
                      setSelectedDifficulty('All');
                      setSelectedStatus('All');
                    }}
                    className="px-3 py-1.5 text-xs text-blue-600 font-semibold bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {activeNotesProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-500">
                  {activeNotesProblem.code} • {activeNotesProblem.topic}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {activeNotesProblem.title}
                </h3>
              </div>
              <button
                onClick={() => !isSavingNotes && setActiveNotesProblem(null)}
                disabled={isSavingNotes}
                className="text-slate-400 hover:text-slate-600 p-1 rounded disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {notesError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{notesError}</span>
                </div>
              )}
              <label className="block text-xs font-semibold text-slate-700">
                Algorithm Approach & Edge Case Notes:
              </label>
              <textarea
                rows={6}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                disabled={isSavingNotes}
                placeholder="Write your key takeaways, time/space complexity, edge cases (e.g. empty inputs, duplicate keys, integer overflow)..."
                className="w-full p-2.5 text-xs sm:text-sm font-mono border border-slate-300 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed disabled:bg-slate-50"
              />
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={() => setActiveNotesProblem(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-xs disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSavingNotes && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                {isSavingNotes ? 'Saving Notes...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Problem Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New DSA Problem</h3>
                <p className="text-xs text-slate-500">
                  Track problems from LeetCode, CodeStudio, or company OA archives
                </p>
              </div>
              <button
                onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Problem Code
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    disabled={isSubmitting}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="LC-0152"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    disabled={isSubmitting}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Maximum Product Subarray"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Topic
                  </label>
                  <select
                    value={newTopic}
                    disabled={isSubmitting}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    <option value="Arrays & Hashing">Arrays & Hashing</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Stack & Queue">Stack & Queue</option>
                    <option value="Binary Search">Binary Search</option>
                    <option value="Linked Lists">Linked Lists</option>
                    <option value="Binary Trees">Binary Trees</option>
                    <option value="Graphs">Graphs</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Backtracking">Backtracking</option>
                    <option value="Heaps & Priority Queues">Heaps</option>
                    <option value="Bit Manipulation">Bit Manipulation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    disabled={isSubmitting}
                    onChange={(e) => setNewDifficulty(e.target.value as DSADifficulty)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    disabled={isSubmitting}
                    onChange={(e) => setNewPlatform(e.target.value as DSAPlatform)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="CodeStudio">CodeStudio</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="InterviewBit">InterviewBit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Problem URL (Optional)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  disabled={isSubmitting}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  disabled={isSubmitting}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Dynamic Programming, Prefix Product, Array"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Initial Notes / Key Intuition
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  disabled={isSubmitting}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Maintain maxProduct and minProduct due to negative sign flips..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
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
                  {isSubmitting ? 'Saving Problem...' : 'Add Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(problemToDelete)}
        title="Delete DSA Problem"
        message={`Are you sure you want to remove "${problemToDelete?.title}" (${problemToDelete?.code})? Your solved state and revision logs for this problem will be deleted.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        isDestructive={true}
        onCancel={() => !isDeleting && setProblemToDelete(null)}
        onConfirm={async () => {
          if (problemToDelete) {
            try {
              setIsDeleting(true);
              await onDeleteProblem(problemToDelete.id);
              setProblemToDelete(null);
            } catch (err) {
              console.error('Failed to delete problem:', err);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
      />
    </div>
  );
};
