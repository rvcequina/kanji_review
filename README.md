# Nihonggo – JLPT Review (React + TypeScript + Vite + Tailwind)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
```

## Layout
```
src/
  types/index.ts            JLPTItem, JLPTGrammar, SRSProgress + app types
  data/db.json              mock DB (N5–N1 kanji, vocab, grammar)
  lib/
    entries.ts              loads db.json → typed, ordered entries
    srs.ts                  stages, intervals, level up/down, due dates
    romaji.ts               romaji → hiragana (live IME-style typing)
    answer.ts               meaning / reading / grammar answer checking
    theme.ts                kanji=pink, vocab=purple, grammar=teal
  hooks/
    useLocalStorage.ts      validated localStorage state
    useSRSStore.ts          progress, due queue, stats, mock time
    useSRS.ts               context consumer
    useLessonSession.ts     5-item lesson batches
    useReviewSession.ts     review queue engine
  context/SRSContext.ts, SRSProvider.tsx
  components/               Sidebar, EntryDetail, LessonSession, ReviewSession
  components/views/         Dashboard, LevelBrowser, Settings
  components/ui/            ProgressBar, Badge
```

## Notes
- SRS levels 1–8: Apprentice 1–2, Guru 3–4, Master 5, Enlightened 6–7, Burned 8. Intervals: 4h, 8h, 1d, 2d, 1w, 2w, 1mo.
- Lesson completion → level 1, first review due in 4h. Use Settings → Mock Time Forward to test.
- Wrong answers: -1 level (-2 if 2+ mistakes or item was Master+).
- Grammar `correctKana` accepts alternatives separated by `|`; kanji readings by `、`.
- `_previous_partial/` holds files that were already in this folder from an earlier attempt; they are not used.

## Deploy to GitHub Pages
1. Push to a GitHub repo's `main` branch.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes on every push.
Progress is stored in each visitor's browser (localStorage), so there is no backend to host.
