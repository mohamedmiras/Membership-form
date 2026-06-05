import localforage from 'localforage';
import type { Submission } from '../types';

localforage.config({
  name: 'MembershipPosterApp',
  storeName: 'submissions', // Should be alphanumeric, with underscores.
  description: 'Stores membership submissions'
});

export const saveSubmission = async (submission: Submission): Promise<void> => {
  try {
    const existing = (await localforage.getItem<Submission[]>('all_submissions')) || [];
    existing.push(submission);
    await localforage.setItem('all_submissions', existing);
  } catch (err) {
    console.error('Error saving submission:', err);
    throw err;
  }
};

export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const submissions = await localforage.getItem<Submission[]>('all_submissions');
    return submissions || [];
  } catch (err) {
    console.error('Error getting submissions:', err);
    return [];
  }
};

export const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  try {
    const existing = (await localforage.getItem<Submission[]>('all_submissions')) || [];
    const updated = existing.map(sub => sub.id === id ? { ...sub, status } : sub);
    await localforage.setItem('all_submissions', updated);
  } catch (err) {
    console.error('Error updating status:', err);
    throw err;
  }
};

export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    const existing = (await localforage.getItem<Submission[]>('all_submissions')) || [];
    const updated = existing.filter(sub => sub.id !== id);
    await localforage.setItem('all_submissions', updated);
  } catch (err) {
    console.error('Error deleting submission:', err);
    throw err;
  }
};
