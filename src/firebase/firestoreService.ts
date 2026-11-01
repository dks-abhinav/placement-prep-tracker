import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  UserProfile,
  DSAProblem,
  PlannerTask,
  JobApplication,
  CoreCSSubject,
  MockInterview,
  ChecklistItem,
} from '../types';
import { initialCoreCSSubjects, initialChecklist } from '../data/initialData';

// --- User Profile ---

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- DSA Problems ---

export async function fetchUserDSA(uid: string): Promise<DSAProblem[]> {
  const path = `users/${uid}/dsaProblems`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'dsaProblems'));
    return snap.docs.map((d) => d.data() as DSAProblem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserDSAProblem(uid: string, problem: DSAProblem): Promise<void> {
  const path = `users/${uid}/dsaProblems/${problem.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'dsaProblems', problem.id), {
      ...problem,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserDSAProblem(uid: string, problemId: string): Promise<void> {
  const path = `users/${uid}/dsaProblems/${problemId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'dsaProblems', problemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchSaveDSAProblems(uid: string, problems: DSAProblem[]): Promise<void> {
  const path = `users/${uid}/dsaProblems`;
  try {
    const batch = writeBatch(db);
    problems.forEach((p) => {
      const ref = doc(db, 'users', uid, 'dsaProblems', p.id);
      batch.set(ref, {
        ...p,
        userId: uid,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Tasks ---

export async function fetchUserTasks(uid: string): Promise<PlannerTask[]> {
  const path = `users/${uid}/tasks`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'tasks'));
    return snap.docs.map((d) => d.data() as PlannerTask);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserTask(uid: string, task: PlannerTask): Promise<void> {
  const path = `users/${uid}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'tasks', task.id), {
      ...task,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserTask(uid: string, taskId: string): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Applications ---

export async function fetchUserApplications(uid: string): Promise<JobApplication[]> {
  const path = `users/${uid}/applications`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'applications'));
    const apps: JobApplication[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        company: data.company || '',
        role: data.role || '',
        ctcLpa: data.ctcLpa || 'Undisclosed',
        tier: data.tier || '[Product / 18-24 LPA]',
        status: data.status || 'Applied',
        appliedDate: data.appliedDate || '',
        oaOrInterviewDate: data.oaOrInterviewDate || '',
        location: data.location || 'Pan India',
        notes: data.notes || '',
      };
    });
    return apps.sort((a, b) => (b.appliedDate > a.appliedDate ? 1 : -1));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserApplication(uid: string, app: JobApplication): Promise<void> {
  const path = `users/${uid}/applications/${app.id}`;
  try {
    const docData: Record<string, any> = {
      id: app.id,
      userId: uid,
      company: (app.company || '').trim(),
      role: (app.role || '').trim(),
      ctcLpa: (app.ctcLpa || 'Undisclosed').trim(),
      tier: app.tier,
      status: app.status,
      appliedDate: app.appliedDate,
      location: (app.location || 'Pan India').trim(),
      updatedAt: new Date().toISOString(),
    };

    if (app.oaOrInterviewDate && app.oaOrInterviewDate.trim()) {
      docData.oaOrInterviewDate = app.oaOrInterviewDate.trim();
    }
    if (app.notes && app.notes.trim()) {
      docData.notes = app.notes.trim();
    }

    await setDoc(doc(db, 'users', uid, 'applications', app.id), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserApplication(uid: string, appId: string): Promise<void> {
  const path = `users/${uid}/applications/${appId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'applications', appId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Core CS Subjects ---

export async function fetchUserCoreCS(uid: string): Promise<CoreCSSubject[]> {
  const path = `users/${uid}/coreCS`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'coreCS'));
    const savedSubjectMap = new Map<string, string[]>();
    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      savedSubjectMap.set(docSnap.id, data.completedTopicIds || []);
    });

    // Merge with standard curriculum
    return initialCoreCSSubjects.map((subject) => {
      const completedIds = savedSubjectMap.get(subject.id);
      return {
        ...subject,
        topics: subject.topics.map((t) => ({
          ...t,
          completed: completedIds ? completedIds.includes(t.id) : false,
        })),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserCoreCSTopicToggle(
  uid: string,
  subjectId: string,
  completedTopicIds: string[]
): Promise<void> {
  const path = `users/${uid}/coreCS/${subjectId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'coreCS', subjectId), {
      id: subjectId,
      userId: uid,
      completedTopicIds,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Mock Interviews ---

export async function fetchUserMocks(uid: string): Promise<MockInterview[]> {
  const path = `users/${uid}/mocks`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'mocks'));
    return snap.docs.map((d) => d.data() as MockInterview);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserMock(uid: string, mock: MockInterview): Promise<void> {
  const path = `users/${uid}/mocks/${mock.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'mocks', mock.id), {
      ...mock,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserMock(uid: string, mockId: string): Promise<void> {
  const path = `users/${uid}/mocks/${mockId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'mocks', mockId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Resume Checklist ---

export async function fetchUserChecklist(uid: string): Promise<ChecklistItem[]> {
  const path = `users/${uid}/checklist`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'checklist'));
    const savedMap = new Map<string, boolean>();
    snap.docs.forEach((d) => {
      savedMap.set(d.id, Boolean(d.data().checked));
    });

    return initialChecklist.map((item) => ({
      ...item,
      checked: savedMap.has(item.id) ? Boolean(savedMap.get(item.id)) : false,
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserChecklistItem(
  uid: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  const path = `users/${uid}/checklist/${itemId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'checklist', itemId), {
      id: itemId,
      userId: uid,
      checked,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserAllChecklist(
  uid: string,
  items: ChecklistItem[],
  checkedState: boolean
): Promise<void> {
  const path = `users/${uid}/checklist`;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const ref = doc(db, 'users', uid, 'checklist', item.id);
      batch.set(ref, {
        id: item.id,
        userId: uid,
        checked: checkedState,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
