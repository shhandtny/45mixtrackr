# Design: dj-cover-downloader

**Feature**: dj-cover-downloader
**Created**: 2026-03-31
**Phase**: Design
**Architecture**: Option C — Pragmatic Balance
**Level**: Dynamic

---

## Context Anchor

| Dimension | Detail |
|-----------|--------|
| **WHY** | DJs spend hours manually captioning mixes; automation saves significant post-production time |
| **WHO** | DJ content creators publishing mixes to YouTube / social media |
| **RISK** | ACRCloud accuracy on long mixes; Vercel file size limits; ffmpeg availability |
| **SUCCESS** | ≥80% song recognition; SRT imports correctly; ZIP contains covers |
| **SCOPE** | Next.js + ACRCloud + React; no auth for MVP; Spotify-style track list UI |

---

## 1. Overview

Option C — async job with 2-second client polling. The user uploads a recording via `formidable` (bypasses Next.js body size limit), receives a `jobId`, and the React client polls `/api/status/[id]` every 2 seconds. Each poll returns newly identified tracks, which are appended to the Spotify-style track list. When processing completes, a Download ZIP button activates.

**Architecture Decision Record**:
- **Upload**: `formidable` with `bodyParser: false` → supports files up to 500 MB
- **Progress**: Client polling every 2s → simpler than SSE, Vercel-compatible
- **State**: In-memory `Map<jobId, Job>` → sufficient for MVP single-instance
- **ffmpeg**: `ffmpeg-static` npm package → works on Vercel without system deps
- **Segmentation**: 10s audio chunks, 5s overlap → ACRCloud fingerprinting
- **UI**: Spotify-style dark track list — cover thumbnail + title + artist + timestamp per row

---

## 2. Data Models

```typescript
// types/index.ts

export type JobStatus =
  | 'uploading'
  | 'segmenting'
  | 'identifying'
  | 'packaging'
  | 'done'
  | 'error';

export interface Track {
  index: number;           // 1-based position in mix
  title: string;
  artist: string;
  album: string;
  startTime: number;       // seconds from start of recording
  endTime: number;         // seconds
  coverUrl: string | null; // remote URL from ACRCloud response
  coverFilename: string;   // e.g. "cover-01.jpg"
  recognized: boolean;     // false = unidentified segment
}

export interface Job {
  id: string;              // uuid
  status: JobStatus;
  inputPath: string;       // /tmp/{id}/input.{ext}
  workDir: string;         // /tmp/{id}/
  tracks: Track[];
  totalSegments: number;
  processedSegments: number;
  error?: string;
  createdAt: number;       // Date.now()
}

export interface ACRCloudResult {
  status: { code: number; msg: string };
  metadata?: {
    music: Array<{
      title: string;
      artists: Array<{ name: string }>;
      album: { name: string };
      external_metadata?: {
        spotify?: {
          album?: { images?: Array<{ url: string; width: number }> };
        };
      };
      play_offset_ms: number;
      duration_ms: number;
    }>;
  };
}
```

---

## 3. File Structure

```
webApp-cover-downloader/
├── app/
│   ├── page.tsx                      # Main page — upload + track list
│   ├── layout.tsx                    # Root layout, dark theme
│   ├── globals.css                   # Tailwind base + Spotify-style vars
│   └── api/
│       ├── upload/
│       │   └── route.ts              # POST: receive file, start job
│       ├── status/
│       │   └── [id]/
│       │       └── route.ts          # GET: job progress + new tracks
│       ├── result/
│       │   └── [id]/
│       │       └── route.ts          # GET: full track list JSON
│       └── download/
│           └── [id]/
│               └── route.ts          # GET: stream ZIP
├── lib/
│   ├── job-store.ts                  # In-memory Map<id, Job>
│   ├── acr-cloud.ts                  # ACRCloud API wrapper + HMAC-SHA1 signing
│   ├── ffmpeg-segmenter.ts           # Split audio → chunks in /tmp
│   ├── recognition-pipeline.ts       # Orchestrate: segment → identify → store
│   ├── srt-builder.ts                # Track[] → .srt string
│   ├── cover-fetcher.ts              # Fetch cover URLs → save to /tmp
│   └── zip-builder.ts                # Build ZIP from /tmp/{id}/ and stream
├── components/
│   ├── UploadZone.tsx                # Drag-and-drop, file validation, progress bar
│   ├── ProcessingStatus.tsx          # Step indicator (uploading/segmenting/identifying)
│   ├── TrackList.tsx                 # Spotify-style table of identified tracks
│   ├── TrackRow.tsx                  # Single row: cover + index + title + artist + time
│   ├── DownloadButton.tsx            # Active when status === 'done'
│   └── UnrecognizedBadge.tsx         # Visual indicator for unidentified segments
├── hooks/
│   └── useJobPoller.ts               # Poll /api/status every 2s, update track list
├── types/
│   └── index.ts                      # Track, Job, ACRCloudResult types
├── next.config.ts                    # bodyParser false for /api/upload
└── .env.local                        # ACR_HOST, ACR_ACCESS_KEY, ACR_ACCESS_SECRET
```

---

## 4. API Contracts

### POST /api/upload
**Request**: `multipart/form-data` with field `file`
**Response**:
```json
{ "jobId": "abc123" }
```
**Errors**: `400` (missing file), `413` (file too large), `415` (unsupported type)
**Side effect**: Spawns `recognitionPipeline(job)` as a background async call (fire-and-forget)

---

### GET /api/status/[id]
**Response**:
```json
{
  "status": "identifying",
  "step": "Identifying songs… (24/60)",
  "processedSegments": 24,
  "totalSegments": 60,
  "newTracks": [
    {
      "index": 3,
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "startTime": 183,
      "endTime": 367,
      "coverUrl": "https://i.scdn.co/image/...",
      "coverFilename": "cover-03.jpg",
      "recognized": true
    }
  ]
}
```
**Polling strategy**: Client keeps a `lastTrackIndex` counter; server returns only tracks with `index > lastTrackIndex`

---

### GET /api/result/[id]
**Response**:
```json
{
  "tracks": [ /* full Track[] array */ ]
}
```

---

### GET /api/download/[id]
**Response**: `application/zip` stream
**ZIP contents**:
```
mix-{jobId}/
├── subtitles.srt
├── cover-01.jpg
├── cover-02.jpg
└── cover-N.jpg
```
**Triggers**: Cleanup of `/tmp/{id}/` after streaming completes

---

## 5. lib Module Specs

### lib/job-store.ts
```typescript
const jobs = new Map<string, Job>();

export function createJob(id: string, inputPath: string, workDir: string): Job
export function getJob(id: string): Job | undefined
export function updateJob(id: string, patch: Partial<Job>): void
export function addTrack(id: string, track: Track): void
```

### lib/acr-cloud.ts
```typescript
// HMAC-SHA1 signature per ACRCloud docs
export async function identifySegment(
  audioBuffer: Buffer,
  accessKey: string,
  accessSecret: string,
  host: string
): Promise<ACRCloudResult>

export function extractTrackMeta(result: ACRCloudResult): {
  title: string; artist: string; album: string; coverUrl: string | null
} | null
```

### lib/ffmpeg-segmenter.ts
```typescript
// Uses ffmpeg-static binary path
export async function segmentAudio(
  inputPath: string,
  outputDir: string,
  segmentDuration: number = 10,
  overlap: number = 5
): Promise<Array<{ path: string; startTime: number; endTime: number }>>
```

### lib/recognition-pipeline.ts
```typescript
// Orchestrator: segment → batch identify → store tracks
export async function recognitionPipeline(job: Job): Promise<void>
// - Updates job.status through: segmenting → identifying → packaging → done
// - Calls ffmpeg-segmenter, then processes chunks sequentially (rate limiting)
// - Calls cover-fetcher after all segments processed
// - Calls zip-builder to pre-build ZIP
```

### lib/srt-builder.ts
```typescript
export function buildSrt(tracks: Track[]): string
// Format: standard SRT with "Title - Artist" per entry
// Merges consecutive duplicates (same title+artist)
// Converts seconds → HH:MM:SS,mmm
```

### lib/cover-fetcher.ts
```typescript
export async function fetchCovers(
  tracks: Track[],
  workDir: string
): Promise<void>
// Downloads each track.coverUrl → workDir/cover-NN.jpg
// Sets coverFilename on each track
// Falls back to placeholder if URL is null
```

### lib/zip-builder.ts
```typescript
export async function buildZip(job: Job, outputPath: string): Promise<void>
// Uses archiver to create ZIP: SRT + all cover-NN.jpg files

export function streamZip(zipPath: string, res: NextResponse): void
```

---

## 6. UI Design — Spotify Style

### Color Tokens
```css
/* globals.css */
:root {
  --bg-base:       #121212;   /* Spotify black */
  --bg-surface:    #181818;   /* card/row background */
  --bg-highlight:  #282828;   /* hover state */
  --text-primary:  #FFFFFF;
  --text-secondary:#B3B3B3;
  --accent-green:  #1DB954;   /* Spotify green — progress, active */
  --text-dim:      #535353;   /* track index, unrecognized */
}
```

### Page Layout
```
┌─────────────────────────────────────────────────────────┐
│  DJ Mix Identifier                          [dark theme] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌───────────────────────────────────────────────────┐ │
│   │  ↑  Drop your mix here, or click to browse        │ │
│   │     MP3, MP4, WAV, M4A — up to 500 MB             │ │
│   └───────────────────────────────────────────────────┘ │
│                                                          │
│   ████████████████████░░░░░░  Identifying… (24/60)      │
│                                                          │
│   #   Cover   Title                Artist         Time   │
│   ─────────────────────────────────────────────────────  │
│   1   [img]   Lose Yourself        Eminem         0:00   │
│   2   [img]   Blinding Lights      The Weeknd     3:24   │
│   3   [img]   One More Time        Daft Punk      6:47   │
│   4   ░░░░   Unrecognized          —              9:55   │
│   5   [img]   Levels               Avicii        12:10   │
│                                                          │
│                      [ Download ZIP ]                    │
└─────────────────────────────────────────────────────────┘
```

### TrackRow Component
```tsx
// components/TrackRow.tsx
interface TrackRowProps {
  track: Track;
  isNew?: boolean; // triggers fade-in animation
}
```
- Cover: 40×40px rounded square, `object-cover`
- Index: right-aligned, `text-dim` color
- Title: `text-primary`, bold
- Artist: `text-secondary`
- Time: `text-secondary`, formatted as `MM:SS`
- Unrecognized row: cover replaced with grey placeholder + `UnrecognizedBadge`
- `isNew` → `animate-fade-in` Tailwind animation (0.3s ease-in)

---

## 7. useJobPoller Hook

```typescript
// hooks/useJobPoller.ts
export function useJobPoller(jobId: string | null) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const lastIndexRef = useRef(0);

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/status/${jobId}?after=${lastIndexRef.current}`);
      const data = await res.json();
      setStatus(data.status);
      setStep(data.step);
      setProgress({ processed: data.processedSegments, total: data.totalSegments });
      if (data.newTracks?.length) {
        lastIndexRef.current = data.newTracks.at(-1).index;
        setTracks(prev => [...prev, ...data.newTracks]);
      }
      if (data.status === 'done' || data.status === 'error') {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return { tracks, status, step, progress };
}
```

---

## 8. ACRCloud Signing

ACRCloud requires HMAC-SHA1 signature per request:

```typescript
// lib/acr-cloud.ts (signing logic)
import crypto from 'crypto';

function sign(method: string, uri: string, accessKey: string, dataType: string,
              signatureVersion: string, timestamp: string, secret: string): string {
  const stringToSign = [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  return crypto.createHmac('sha256', secret).update(stringToSign).digest('base64');
}
```

---

## 9. next.config.ts

```typescript
// next.config.ts
const nextConfig = {
  api: {
    bodyParser: false,           // Required for formidable on /api/upload
    responseLimit: '500mb',
  },
};

export default nextConfig;
```

---

## 10. Environment Variables

```bash
# .env.local
ACR_HOST=identify-eu-west-1.acrcloud.com
ACR_ACCESS_KEY=your_access_key
ACR_ACCESS_SECRET=your_access_secret
```

---

## 11. Implementation Guide

### 11.1 Implementation Order

| Step | Module | Files | Notes |
|------|--------|-------|-------|
| 1 | Project init | `package.json`, `next.config.ts`, `.env.local` | `npx create-next-app`, install deps |
| 2 | Types | `types/index.ts` | Define all types first |
| 3 | Job store | `lib/job-store.ts` | In-memory Map |
| 4 | ACRCloud | `lib/acr-cloud.ts` | API wrapper + signing |
| 5 | ffmpeg segmenter | `lib/ffmpeg-segmenter.ts` | Test with a short sample |
| 6 | SRT builder | `lib/srt-builder.ts` | Pure function, easy to test |
| 7 | Cover fetcher | `lib/cover-fetcher.ts` | fetch → save to /tmp |
| 8 | ZIP builder | `lib/zip-builder.ts` | archiver stream |
| 9 | Recognition pipeline | `lib/recognition-pipeline.ts` | Orchestrate steps 4-8 |
| 10 | API routes | `app/api/*/route.ts` | upload → status → result → download |
| 11 | useJobPoller | `hooks/useJobPoller.ts` | Frontend polling logic |
| 12 | UI components | `components/*.tsx` | UploadZone → ProcessingStatus → TrackList → DownloadButton |
| 13 | Main page | `app/page.tsx` | Assemble all components |
| 14 | Styling | `app/globals.css` | Spotify CSS vars + animations |

### 11.2 Dependencies

```bash
# Install
npm install formidable archiver fluent-ffmpeg ffmpeg-static
npm install uuid
npm install -D @types/formidable @types/archiver @types/fluent-ffmpeg @types/uuid

# Tailwind (if not in create-next-app)
npm install -D tailwindcss postcss autoprefixer
```

### 11.3 Session Guide

| Module | Scope Key | Files | Session |
|--------|-----------|-------|---------|
| Foundation | `module-1` | types, job-store, next.config | Session 1 |
| ACRCloud + ffmpeg | `module-2` | acr-cloud, ffmpeg-segmenter | Session 1 |
| Output builders | `module-3` | srt-builder, cover-fetcher, zip-builder | Session 2 |
| Pipeline + API | `module-4` | recognition-pipeline, all api routes | Session 2 |
| Frontend | `module-5` | hooks, all components, page, globals.css | Session 3 |

Use `/pdca do dj-cover-downloader --scope module-1` to start with foundations.

---

## 12. Test Plan

| Scenario | Expected |
|----------|----------|
| Upload MP3 < 10 MB | jobId returned, status polling starts |
| Upload unsupported format (.avi) | 415 error shown in UI |
| Upload > 500 MB | 413 error shown in UI |
| 60-min mix processed | ≥80% tracks identified, all with correct timecodes |
| SRT opened in DaVinci Resolve | Captions appear at correct timestamps |
| ZIP extracted | `subtitles.srt` + `cover-01.jpg`…`cover-N.jpg` present |
| Unrecognized segment | Grey placeholder row, excluded from SRT |
| Duplicate consecutive tracks | Merged into single SRT entry |
