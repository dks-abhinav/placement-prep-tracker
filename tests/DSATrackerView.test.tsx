import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DSATrackerView } from '../src/components/views/DSATrackerView';
import { DSAProblem } from '../src/types';

describe('DSATrackerView Component-Level Error Handling Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const sampleProblem: DSAProblem = {
    id: 'prob-rain-water',
    code: 'LC-0042',
    title: 'Trapping Rain Water',
    topic: 'Two Pointers',
    difficulty: 'Hard',
    solved: false,
    bookmarked: false,
    revisionsCount: 1,
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/trapping-rain-water',
    notes: 'Initial intuition: prefix maximum and suffix maximum arrays.',
    tags: ['Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
  };

  /**
   * TEST 1 — Failed DSA problem creation:
   * - Render the actual DSATrackerView component with isAddModalOpen=true.
   * - Make the actual persistence callback (onAddProblem) reject.
   * - Verify the modal remains open.
   * - Verify all entered form fields remain intact.
   * - Verify the error is displayed.
   * - Verify the submit button becomes enabled again.
   */
  it('TEST 1: handles problem creation failure by preserving draft fields, keeping modal open, displaying error, and re-enabling submit button', async () => {
    const setIsAddModalOpen = vi.fn();
    const onAddProblem = vi.fn().mockRejectedValue(new Error('Firestore write error: custom DSA problem rejected'));
    const onToggleSolved = vi.fn();
    const onToggleBookmark = vi.fn();
    const onIncrementRevision = vi.fn();
    const onUpdateNotes = vi.fn();
    const onDeleteProblem = vi.fn();

    const { container } = render(
      <DSATrackerView
        problems={[sampleProblem]}
        onToggleSolved={onToggleSolved}
        onToggleBookmark={onToggleBookmark}
        onIncrementRevision={onIncrementRevision}
        onAddProblem={onAddProblem}
        onUpdateNotes={onUpdateNotes}
        onDeleteProblem={onDeleteProblem}
        isAddModalOpen={true}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    );

    // 1. Verify modal is rendered
    expect(screen.getByText('Add New DSA Problem')).toBeDefined();

    // 2. Identify form input elements
    const codeInput = screen.getByPlaceholderText('LC-0152') as HTMLInputElement;
    const titleInput = screen.getByPlaceholderText('Maximum Product Subarray') as HTMLInputElement;
    const topicSelect = screen.getByDisplayValue('Arrays & Hashing') as HTMLSelectElement;
    const difficultySelect = screen.getByDisplayValue('Medium') as HTMLSelectElement;
    const urlInput = screen.getByPlaceholderText('https://leetcode.com/problems/...') as HTMLInputElement;
    const tagsInput = screen.getByPlaceholderText('Dynamic Programming, Prefix Product, Array') as HTMLInputElement;
    const notesInput = screen.getByPlaceholderText('Maintain maxProduct and minProduct due to negative sign flips...') as HTMLTextAreaElement;

    // 3. Fill in recognizable values
    fireEvent.change(codeInput, { target: { value: 'LC-0152' } });
    fireEvent.change(titleInput, { target: { value: 'Maximum Product Subarray' } });
    fireEvent.change(topicSelect, { target: { value: 'Dynamic Programming' } });
    fireEvent.change(difficultySelect, { target: { value: 'Medium' } });
    fireEvent.change(urlInput, { target: { value: 'https://leetcode.com/problems/maximum-product-subarray' } });
    fireEvent.change(tagsInput, { target: { value: 'Dynamic Programming, Prefix Product' } });
    fireEvent.change(notesInput, { target: { value: 'Maintain running max and min products because negative elements flip sign.' } });

    // 4. Submit form
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    // 5. Verify onAddProblem was called with exact fields
    expect(onAddProblem).toHaveBeenCalledTimes(1);
    expect(onAddProblem).toHaveBeenCalledWith({
      code: 'LC-0152',
      title: 'Maximum Product Subarray',
      topic: 'Dynamic Programming',
      difficulty: 'Medium',
      solved: false,
      bookmarked: false,
      revisionsCount: 0,
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/maximum-product-subarray',
      notes: 'Maintain running max and min products because negative elements flip sign.',
      tags: ['Dynamic Programming', 'Prefix Product'],
    });

    // 6. Wait for error handling to complete
    await waitFor(() => {
      expect(screen.getByText('Firestore write error: custom DSA problem rejected')).toBeDefined();
    });

    // 7. Verify modal remains open
    expect(setIsAddModalOpen).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('Add New DSA Problem')).toBeDefined();

    // 8. Verify all entered values remain intact
    expect(codeInput.value).toBe('LC-0152');
    expect(titleInput.value).toBe('Maximum Product Subarray');
    expect(topicSelect.value).toBe('Dynamic Programming');
    expect(difficultySelect.value).toBe('Medium');
    expect(urlInput.value).toBe('https://leetcode.com/problems/maximum-product-subarray');
    expect(tagsInput.value).toBe('Dynamic Programming, Prefix Product');
    expect(notesInput.value).toBe('Maintain running max and min products because negative elements flip sign.');

    // 9. Verify submit button is enabled again
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Add Problem');
  });

  /**
   * TEST 2 — Failed approach-notes save:
   * - Enter recognizable notes.
   * - Reject the persistence callback.
   * - Verify the notes dialog remains open and the entered text is preserved.
   * - Verify an error is displayed.
   */
  it('TEST 2: handles notes save failure by preserving draft notes, keeping dialog open, displaying error, and re-enabling save button', async () => {
    const onUpdateNotes = vi.fn().mockRejectedValue(new Error('Cloud Firestore unavailable: approach notes not saved'));

    render(
      <DSATrackerView
        problems={[sampleProblem]}
        onToggleSolved={vi.fn()}
        onToggleBookmark={vi.fn()}
        onIncrementRevision={vi.fn()}
        onAddProblem={vi.fn()}
        onUpdateNotes={onUpdateNotes}
        onDeleteProblem={vi.fn()}
        isAddModalOpen={false}
        setIsAddModalOpen={vi.fn()}
      />
    );

    // 1. Open notes dialog
    const openNotesButton = screen.getByTitle('View / Edit approach notes');
    fireEvent.click(openNotesButton);

    // 2. Verify notes dialog is open for this problem
    expect(screen.getByText('LC-0042 • Two Pointers')).toBeDefined();

    // 3. Enter recognizable notes into textarea
    const notesTextarea = screen.getByPlaceholderText(/Write your key takeaways, time\/space complexity/i) as HTMLTextAreaElement;
    fireEvent.change(notesTextarea, {
      target: {
        value: 'Optimal two-pointer approach: left_max and right_max bounds water level at each index in O(N) time and O(1) space.',
      },
    });

    // 4. Click Save Notes button
    const saveNotesButton = screen.getByRole('button', { name: /Save Notes/i }) as HTMLButtonElement;
    fireEvent.click(saveNotesButton);

    // 5. Verify onUpdateNotes was called with problem ID and draft notes
    expect(onUpdateNotes).toHaveBeenCalledTimes(1);
    expect(onUpdateNotes).toHaveBeenCalledWith(
      'prob-rain-water',
      'Optimal two-pointer approach: left_max and right_max bounds water level at each index in O(N) time and O(1) space.'
    );

    // 6. Wait for error handling to complete
    await waitFor(() => {
      expect(screen.getByText('Cloud Firestore unavailable: approach notes not saved')).toBeDefined();
    });

    // 7. Verify dialog remains open
    expect(screen.getByText('LC-0042 • Two Pointers')).toBeDefined();

    // 8. Verify entered text is preserved
    expect(notesTextarea.value).toBe(
      'Optimal two-pointer approach: left_max and right_max bounds water level at each index in O(N) time and O(1) space.'
    );

    // 9. Verify save button is re-enabled
    expect(saveNotesButton.disabled).toBe(false);
    expect(saveNotesButton.textContent).toContain('Save Notes');
  });
});
