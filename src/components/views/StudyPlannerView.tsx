import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  X,
  Filter,
  RotateCw,
} from 'lucide-react';
import { PlannerTask, TaskCategory, TaskPriority } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface StudyPlannerViewProps {
  tasks: PlannerTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<PlannerTask, 'id'>) => Promise<void> | void;
  onUpdateTask: (task: PlannerTask) => Promise<void> | void;
  onDeleteTask: (id: string) => Promise<void> | void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Edit task modal
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  // Delete task modal
  const [taskToDelete, setTaskToDelete] = useState<PlannerTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for Add / Edit
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('DSA Sprint');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [dueDate, setDueDate] = useState('2026-11-01');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: TaskCategory[] = [
    'DSA Sprint',
    'Core CS',
    'Aptitude & OAs',
    'Mock Prep',
    'Resume & Projects',
  ];

  const handleOpenAddModal = () => {
    setTitle('');
    setCategory('DSA Sprint');
    setPriority('High');
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (task: PlannerTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setNotes(task.notes || '');
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title cannot be empty.');
      return;
    }
    if (!dueDate) {
      setFormError('Due date is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      if (editingTask) {
        await onUpdateTask({
          ...editingTask,
          title: title.trim(),
          category,
          priority,
          dueDate,
          notes: notes.trim(),
        });
        setEditingTask(null);
      } else {
        await onAddTask({
          title: title.trim(),
          category,
          priority,
          dueDate,
          completed: false,
          notes: notes.trim(),
        });
        setIsAddModalOpen(false);
      }

      // Reset fields only on successful write
      setTitle('');
      setNotes('');
      setFormError('');
    } catch (err: any) {
      console.error('Failed to save task to cloud:', err);
      setFormError(err?.message || 'Failed to save task to cloud. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterCategory !== 'All' && task.category !== filterCategory) return false;
      if (filterPriority !== 'All' && task.priority !== filterPriority) return false;
      if (filterStatus === 'Pending' && task.completed) return false;
      if (filterStatus === 'Completed' && !task.completed) return false;
      return true;
    });
  }, [tasks, filterCategory, filterPriority, filterStatus]);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Placement Study Planner
              </h2>
              <p className="text-xs text-slate-500">
                Organize topic sprints, company OA prep targets & mock interviews
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
            {(['All', 'Pending', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-600 outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-600 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <span className="ml-auto text-slate-500 font-mono text-[11px]">
            {completedCount}/{tasks.length} tasks completed ({tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50/70 ${
              task.completed ? 'bg-slate-50/40 opacity-75' : ''
            }`}
          >
            {/* Completion Checkbox */}
            <button
              onClick={() => onToggleTask(task.id)}
              className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
              title={task.completed ? 'Mark incomplete' : 'Mark completed'}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
              )}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-semibold ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </span>

                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                    task.priority === 'High'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : task.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {task.priority} Priority
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {task.category}
                </span>
              </div>

              {task.notes && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {task.notes}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleOpenEditModal(task)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTaskToDelete(task)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1">
              Adjust filters or click "Add New Task" to schedule your placement study targets.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {(isAddModalOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingTask ? 'Edit Placement Task' : 'Add New Placement Task'}
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted study goal for your daily and weekly prep sprint
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isSubmitting) {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
                  }
                }}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Striver Graph Series: Dijkstra & Floyd-Warshall"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    disabled={isSubmitting}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    disabled={isSubmitting}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Due Date *
                </label>
                <input
                  type="date"
                  required
                  disabled={isSubmitting}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  disabled={isSubmitting}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Target 6 questions on shortest paths and cycle detection..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
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
                  {isSubmitting ? 'Saving Task...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Task'}
        isDestructive={true}
        onCancel={() => !isDeleting && setTaskToDelete(null)}
        onConfirm={async () => {
          if (taskToDelete) {
            try {
              setIsDeleting(true);
              await onDeleteTask(taskToDelete.id);
              setTaskToDelete(null);
            } catch (err) {
              console.error('Failed to delete task:', err);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
      />
    </div>
  );
};
