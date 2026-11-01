import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { StudyPlannerView } from '../src/components/views/StudyPlannerView';
import { PlannerTask } from '../src/types';

describe('StudyPlannerView Component-Level Error Handling Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const sampleTasks: PlannerTask[] = [
    {
      id: 'task-101',
      title: 'Dynamic Programming Practice: 0/1 Knapsack',
      category: 'DSA Sprint',
      priority: 'High',
      dueDate: '2026-11-05',
      completed: false,
      notes: 'Solve variations: Subset sum and target sum',
    },
  ];

  /**
   * TEST 1 — Failed task creation:
   * - Render the real StudyPlannerView with isAddModalOpen=true.
   * - Fill in recognizable form fields (title, category, priority, dueDate, notes).
   * - Make the onAddTask callback return a rejected Promise (simulating Firestore failure).
   * - Submit the actual form.
   * - Assert that the modal remains open (setIsAddModalOpen(false) was NOT called).
   * - Assert that all entered values remain intact.
   * - Assert that an error message is displayed.
   * - Assert that the submit button becomes enabled again after failure.
   */
  it('TEST 1: handles task creation failure by preserving inputs, keeping modal open, displaying error, and re-enabling submit button', async () => {
    const setIsAddModalOpen = vi.fn();
    const onAddTask = vi.fn().mockRejectedValue(new Error('Network error: Firestore task write rejected'));
    const onToggleTask = vi.fn();
    const onUpdateTask = vi.fn();
    const onDeleteTask = vi.fn();

    const { container } = render(
      <StudyPlannerView
        tasks={sampleTasks}
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        isAddModalOpen={true}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    );

    // 1. Verify modal is rendered
    expect(screen.getByText('Add New Placement Task')).toBeDefined();

    // 2. Identify form controls
    const titleInput = screen.getByPlaceholderText(/e\.g\. Master Striver Graph Series/i) as HTMLInputElement;
    const notesTextarea = screen.getByPlaceholderText(/Target 6 questions on shortest paths/i) as HTMLTextAreaElement;
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const categorySelect = screen.getByDisplayValue('DSA Sprint') as HTMLSelectElement;
    const prioritySelect = screen.getByDisplayValue('High Priority') as HTMLSelectElement;

    // 3. Enter recognizable values
    fireEvent.change(titleInput, { target: { value: 'Distributed Systems: Master Raft Consensus' } });
    fireEvent.change(notesTextarea, { target: { value: 'Implement leader election and log replication invariants.' } });
    fireEvent.change(dateInput, { target: { value: '2026-11-20' } });
    fireEvent.change(categorySelect, { target: { value: 'Core CS' } });
    fireEvent.change(prioritySelect, { target: { value: 'Medium' } });

    // 4. Submit the actual form
    const submitButton = screen.getByRole('button', { name: /Create Task/i }) as HTMLButtonElement;
    fireEvent.click(submitButton);

    // 5. Verify onAddTask was invoked with the exact entered fields
    expect(onAddTask).toHaveBeenCalledTimes(1);
    expect(onAddTask).toHaveBeenCalledWith({
      title: 'Distributed Systems: Master Raft Consensus',
      category: 'Core CS',
      priority: 'Medium',
      dueDate: '2026-11-20',
      completed: false,
      notes: 'Implement leader election and log replication invariants.',
    });

    // 6. Wait for error handling to complete
    await waitFor(() => {
      expect(screen.getByText('Network error: Firestore task write rejected')).toBeDefined();
    });

    // 7. Assert modal remains open (setIsAddModalOpen(false) was NOT called)
    expect(setIsAddModalOpen).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('Add New Placement Task')).toBeDefined();

    // 8. Assert all entered values remain intact
    expect(titleInput.value).toBe('Distributed Systems: Master Raft Consensus');
    expect(notesTextarea.value).toBe('Implement leader election and log replication invariants.');
    expect(dateInput.value).toBe('2026-11-20');
    expect(categorySelect.value).toBe('Core CS');
    expect(prioritySelect.value).toBe('Medium');

    // 9. Assert submit button becomes enabled again and text resets
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Create Task');
  });

  /**
   * TEST 2 — Successful task creation:
   * - Make onAddTask return a Promise that resolves after a delay.
   * - Submit the actual form.
   * - Assert that the modal closes only after persistence resolves.
   * - Assert that the relevant form fields reset.
   */
  it('TEST 2: closes modal and resets form fields only after persistence resolves', async () => {
    let resolvePersistence!: () => void;
    const persistencePromise = new Promise<void>((resolve) => {
      resolvePersistence = resolve;
    });
    const onAddTask = vi.fn().mockImplementation(() => persistencePromise);
    const setIsAddModalOpen = vi.fn();

    const { container } = render(
      <StudyPlannerView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onAddTask={onAddTask}
        onUpdateTask={vi.fn()}
        onDeleteTask={vi.fn()}
        isAddModalOpen={true}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    );

    const titleInput = screen.getByPlaceholderText(/e\.g\. Master Striver Graph Series/i) as HTMLInputElement;
    const notesTextarea = screen.getByPlaceholderText(/Target 6 questions on shortest paths/i) as HTMLTextAreaElement;
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Revise Database Indexing: B+ Trees' } });
    fireEvent.change(notesTextarea, { target: { value: 'Practice composite index questions.' } });
    fireEvent.change(dateInput, { target: { value: '2026-11-12' } });

    const submitButton = screen.getByRole('button', { name: /Create Task/i }) as HTMLButtonElement;
    fireEvent.click(submitButton);

    // Persistence is in flight: modal must NOT be closed yet and button must be disabled
    expect(setIsAddModalOpen).not.toHaveBeenCalled();
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Saving Task...');

    // Resolve the persistence callback
    resolvePersistence();

    // Assert that setIsAddModalOpen(false) is called once persistence resolves
    await waitFor(() => {
      expect(setIsAddModalOpen).toHaveBeenCalledWith(false);
    });

    // Assert form fields have been reset
    expect(titleInput.value).toBe('');
    expect(notesTextarea.value).toBe('');
  });

  /**
   * TEST 3 — Failed task completion:
   * - Render the real component with a task.
   * - Make onToggleTask reject.
   * - Trigger the actual completion control.
   * - Verify the component's actual behavior on rejection.
   * - Note: In Placement Prep Tracker, task list state and optimistic rollback are
   *   managed by App.tsx (the parent component). StudyPlannerView derives completion
   *   strictly from props.tasks. This test verifies that triggering the completion
   *   control delegates to onToggleTask(id) and the component remains stable.
   */
  it('TEST 3: invokes onToggleTask on completion toggle; verifies component state behavior on rejection', async () => {
    const rejectionError = new Error('Firestore update failed: offline or permission-denied');
    const onToggleTask = vi.fn().mockRejectedValue(rejectionError);

    render(
      <StudyPlannerView
        tasks={sampleTasks}
        onToggleTask={onToggleTask}
        onAddTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onDeleteTask={vi.fn()}
        isAddModalOpen={false}
        setIsAddModalOpen={vi.fn()}
      />
    );

    // Verify task is initially displayed as incomplete
    const toggleButton = screen.getByTitle('Mark completed');
    expect(toggleButton).toBeDefined();
    expect(screen.getByText('Dynamic Programming Practice: 0/1 Knapsack')).toBeDefined();

    // Trigger the completion control
    fireEvent.click(toggleButton);

    // Assert onToggleTask was invoked with the exact task ID
    expect(onToggleTask).toHaveBeenCalledTimes(1);
    expect(onToggleTask).toHaveBeenCalledWith('task-101');

    // Wait for the rejected promise to settle
    await expect(onToggleTask.mock.results[0].value).rejects.toThrow('Firestore update failed: offline or permission-denied');

    // Because StudyPlannerView is a controlled component whose completion state is driven
    // strictly by props.tasks, the task completion indicator remains controlled by props.
    // The toggle button remains in its original 'Mark completed' state because props.tasks was not mutated.
    expect(screen.getByTitle('Mark completed')).toBeDefined();

    // Component remains stable and renders task title
    expect(screen.getByText('Dynamic Programming Practice: 0/1 Knapsack')).toBeDefined();
  });
});
