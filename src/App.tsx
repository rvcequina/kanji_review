import { useCallback, useState } from 'react';
import type { Entry, View } from './types';
import { useSRS } from './hooks/useSRS';
import { LESSON_BATCH_SIZE } from './hooks/useLessonSession';
import { REVIEW_BATCH_SIZE } from './hooks/useReviewSession';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { LevelBrowser } from './components/views/LevelBrowser';
import { Settings } from './components/views/Settings';
import { LessonSession } from './components/LessonSession';
import { ReviewSession } from './components/ReviewSession';

type Session = { kind: 'lesson'; entries: Entry[] } | { kind: 'review'; entries: Entry[] } | null;

export default function App() {
  const { dueEntries, unlearned } = useSRS();
  const [view, setView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session>(null);

  const startLessons = useCallback(() => {
    if (unlearned.length) setSession({ kind: 'lesson', entries: unlearned.slice(0, LESSON_BATCH_SIZE) });
  }, [unlearned]);
  const startReviews = useCallback(() => {
    if (dueEntries.length) setSession({ kind: 'review', entries: dueEntries.slice(0, REVIEW_BATCH_SIZE) });
  }, [dueEntries]);
  const exit = useCallback(() => setSession(null), []);

  return (
    <div className="min-h-screen">
      <Sidebar view={view} onChange={setView} dueCount={dueEntries.length} />
      <main className="p-5 pb-24 sm:p-8 md:ml-60 md:pb-8">
        {view === 'dashboard' && <Dashboard onStartLessons={startLessons} onStartReviews={startReviews} />}
        {view === 'browser' && <LevelBrowser />}
        {view === 'settings' && <Settings />}
      </main>
      {session?.kind === 'lesson' && <LessonSession batch={session.entries} onExit={exit} />}
      {session?.kind === 'review' && <ReviewSession entries={session.entries} onExit={exit} />}
    </div>
  );
}
