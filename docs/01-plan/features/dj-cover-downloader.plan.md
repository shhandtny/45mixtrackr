# Plan: dj-cover-downloader

**Feature**: dj-cover-downloader
**Created**: 2026-03-31
**Phase**: Plan
**Level**: Dynamic

---

## Executive Summary

| | |
|---|---|
| **Problem** | DJs record mixes containing multiple songs and must manually look up each track's metadata to add captions in video editing — a slow, tedious process. |
| **Solution** | A Next.js web app where users upload a recording, ACRCloud identifies every song with timestamps, and the app packages the results as a ZIP (SRT subtitle file + album cover images) ready to import into any video editor. |
| **Function / UX Effect** | Single-page upload-and-download flow: drag-and-drop file → processing progress → downloadable ZIP in one click. |
| **Core Value** | Turns a multi-hour manual task into a 2-minute automated workflow, directly usable on the video timeline. |

---

## Context Anchor

| Dimension | Detail |
|-----------|--------|
| **WHY** | DJs spend hours manually captioning mixes; automation saves significant post-production time |
| **WHO** | DJ content creators who publish recorded mixes to YouTube / social media |
| **RISK** | ACRCloud recognition accuracy on long mixes; large file upload size limits; API rate/cost limits |
| **SUCCESS** | User uploads a recording → gets a ZIP with correct SRT timings and cover images for ≥ 80% of songs |
| **SCOPE** | Next.js full-stack app; ACRCloud API; React frontend; no user auth required for MVP |

---

## 1. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can upload an audio or video file (MP3, MP4, WAV, M4A) up to 500 MB | Must |
| FR-02 | Backend splits the recording into overlapping segments and sends each to ACRCloud | Must |
| FR-03 | Each recognized song returns: title, artist, album, start time, end time, album cover URL | Must |
| FR-04 | System generates a `.srt` subtitle file with `"Title - Artist"` text per song segment | Must |
| FR-05 | System downloads album cover images for each song | Must |
| FR-06 | User can download a ZIP containing the `.srt` file and all cover images | Must |
| FR-07 | Recognition results are displayed in a track list before download | Should |
| FR-08 | User can edit song title / artist before downloading | Could |
| FR-09 | Duplicate consecutive songs are merged into a single SRT segment | Should |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Processing progress shown in real-time (SSE or polling) |
| NFR-02 | File upload via multipart form, stored temporarily server-side |
| NFR-03 | Temp files cleaned up after ZIP is generated and downloaded |
| NFR-04 | No user authentication required for MVP |
| NFR-05 | Deployable to Vercel (Next.js) |

---

## 2. User Stories

| Story | Acceptance Criteria |
|-------|---------------------|
| As a DJ, I want to upload my recorded mix so the site can identify the songs | File picker accepts audio/video; upload progress shown |
| As a DJ, I want to see the list of identified songs with timestamps | Track list displays title, artist, start/end time, thumbnail |
| As a DJ, I want to download an SRT file so my video editor shows captions automatically | SRT file has correct sequence numbers, timecodes, and "Title - Artist" text |
| As a DJ, I want album cover images in the ZIP so I can use them in my video | Cover images saved as `cover-01.jpg`, `cover-02.jpg`, etc. |
| As a DJ, I want real-time processing feedback so I know the site is working | Progress bar or step indicator during recognition |

---

## 3. Technical Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 19 + Next.js 14 App Router | Co-located API routes, easy Vercel deploy |
| Styling | Tailwind CSS | Rapid UI development |
| File Upload | `formidable` or Next.js built-in | Multipart handling server-side |
| Music Recognition | ACRCloud REST API | Free tier, DJ-mix optimized, returns timestamps |
| Audio Segmentation | `ffmpeg` (via `fluent-ffmpeg`) | Split recording into 10-second chunks for fingerprinting |
| SRT Generation | Custom utility (pure JS) | Simple format, no library needed |
| ZIP Packaging | `archiver` (Node.js) | Stream ZIP to client |
| Cover Download | `node-fetch` / native fetch | Fetch cover URLs from ACRCloud response |
| Temp Storage | `/tmp` on server (or Vercel `/tmp`) | Ephemeral, no DB needed |

---

## 4. Architecture Overview

```
Browser (React)
  │
  ├─ POST /api/upload        → Save file to /tmp, return jobId
  ├─ GET  /api/status/[id]   → Poll/SSE progress updates
  ├─ GET  /api/result/[id]   → Return track list JSON
  └─ GET  /api/download/[id] → Stream ZIP (SRT + covers)

Server (Next.js API Routes)
  │
  ├─ uploadHandler     → formidable, save to /tmp/{jobId}/input.*
  ├─ recognitionWorker → ffmpeg segments → ACRCloud → parse results
  ├─ srtBuilder        → build .srt from track list
  ├─ coverFetcher      → download cover images to /tmp/{jobId}/
  └─ zipBuilder        → archiver → stream to client
```

---

## 5. SRT Format Specification

```
1
00:00:00,000 --> 00:03:24,000
Lose Yourself - Eminem

2
00:03:24,000 --> 00:06:47,000
Blinding Lights - The Weeknd
```

- Timecodes use `,` as millisecond separator (SRT standard)
- Text format: `{title} - {artist}`
- One entry per unique song segment
- Overlapping or duplicate consecutive entries merged

---

## 6. ACRCloud Integration

**Endpoint**: `https://identify-eu-west-1.acrcloud.com/v1/identify`
**Method**: Multipart POST with audio bytes, access key, timestamp, signature
**Segment strategy**: 10-second chunks, 5-second overlap, sent in parallel batches
**Response fields used**: `metadata.music[0].title`, `.artists[0].name`, `.album.name`, `.external_metadata.spotify.album.images[0].url` (or `.cover_image_url`)

---

## 7. File & Directory Structure

```
webApp-cover-downloader/
├── app/
│   ├── page.tsx                  # Main upload UI
│   ├── layout.tsx
│   └── api/
│       ├── upload/route.ts       # POST: receive file
│       ├── status/[id]/route.ts  # GET: job progress
│       ├── result/[id]/route.ts  # GET: track list JSON
│       └── download/[id]/route.ts # GET: stream ZIP
├── lib/
│   ├── acr-cloud.ts             # ACRCloud API wrapper
│   ├── ffmpeg-segmenter.ts      # Split audio to chunks
│   ├── srt-builder.ts           # Generate .srt content
│   ├── cover-fetcher.ts         # Download cover images
│   ├── zip-builder.ts           # Build and stream ZIP
│   └── job-store.ts             # In-memory job state
├── components/
│   ├── UploadZone.tsx           # Drag-and-drop upload
│   ├── ProgressTracker.tsx      # Real-time status
│   ├── TrackList.tsx            # Identified songs table
│   └── DownloadButton.tsx       # Trigger ZIP download
└── types/
    └── index.ts                  # Track, Job, ACRResponse types
```

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ACRCloud doesn't recognize all songs in a mix | Medium | Show unrecognized segments clearly; allow manual entry (FR-08) |
| Large files exceed Vercel's 4.5 MB API body limit | High | Use client-side chunked upload or presigned approach; set `bodyParser: false` |
| ffmpeg not available on Vercel serverless | High | Use Vercel with `ffmpeg-static` package or switch to edge-compatible approach |
| Temp files accumulate on server | Low | Cleanup after ZIP download or TTL-based job expiry |
| ACRCloud rate limiting | Medium | Sequential batch processing with delay between chunks |

---

## 9. Success Criteria

- [ ] User can upload a file and see progress without page refresh
- [ ] At least 80% of songs in a test mix are correctly identified
- [ ] SRT file imports into DaVinci Resolve / Premiere with correct timecodes
- [ ] ZIP download contains SRT + cover images named `cover-01.jpg` … `cover-N.jpg`
- [ ] App deploys successfully to Vercel
- [ ] Processing a 60-minute mix completes within 5 minutes
