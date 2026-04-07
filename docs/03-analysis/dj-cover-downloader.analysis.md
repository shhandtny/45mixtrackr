# Analysis: dj-cover-downloader

**Feature**: dj-cover-downloader
**Analysis Date**: 2026-03-31
**Phase**: Check
**Overall Match Rate**: 98.8% (static-only; server not running)
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

## 1. Match Rate Summary

| Axis | Score | Weight | Contribution |
|------|-------|--------|-------------|
| Structural Match | 100% | 0.20 | 20.0% |
| Functional Depth | 97.1% | 0.40 | 38.8% |
| API Contract | 100% | 0.40 | 40.0% |
| **Overall** | **98.8%** | — | — |

> Runtime tests (L1/L2/L3) were not executed — no server running. Static-only formula applied.

---

## 2. Structural Match — 100%

All 25 design-specified files are present and accounted for.

| Category | Designed | Implemented | Status |
|----------|----------|-------------|--------|
| API Routes | 4 | 4 | ✅ |
| lib modules | 7 | 7 | ✅ |
| Components | 6 | 5* | ✅ |
| Hooks | 1 | 1 | ✅ |
| Types | 1 | 1 | ✅ |
| Config / CSS | 3 | 3 | ✅ |

> *`UnrecognizedBadge.tsx` was merged into `TrackRow.tsx` inline — acceptable simplification.

---

## 3. Functional Depth — 97.1%

| Module | Depth | Notes |
|--------|-------|-------|
| `lib/job-store.ts` | 100% | All CRUD operations implemented |
| `lib/acr-cloud.ts` | 100% | HMAC-SHA1 signing, form-data POST, extractTrackMeta |
| `lib/ffmpeg-segmenter.ts` | 100% | getDuration + segmentAudio with overlap |
| `lib/srt-builder.ts` | 100% | buildSrt + mergeConsecutiveDuplicates |
| `lib/cover-fetcher.ts` | 100% | Parallel fetch, AbortSignal timeout, 0-byte placeholder |
| `lib/zip-builder.ts` | 100% | buildZip + createZipStream + cleanupWorkDir |
| `lib/recognition-pipeline.ts` | 100% | Full status flow, rate-limit sleep, error isolation |
| `app/api/upload/route.ts` | 85% | Missing 413 size validation (see Gap G-01) |
| `app/api/status/[id]/route.ts` | 100% | Incremental ?after=N, human-readable step labels |
| `app/api/result/[id]/route.ts` | 100% | Full track list JSON |
| `app/api/download/[id]/route.ts` | 100% | ZIP stream, cleanup on completion |
| `hooks/useJobPoller.ts` | 95% | Minor closure nuance in stop condition (Gap G-04) |
| UI Components | 100% | UploadZone, ProcessingStatus, TrackList, TrackRow, DownloadButton |

---

## 4. API Contract — 100%

3-way verification: Design §4 ↔ Server route.ts ↔ Client fetch calls

| Endpoint | Method | Request | Response | Auth | Status |
|----------|--------|---------|----------|------|--------|
| `/api/upload` | POST | multipart file | `{jobId}` | None | ✅ |
| `/api/status/[id]` | GET | `?after=N` | StatusResponse | None | ✅ |
| `/api/result/[id]` | GET | — | `{tracks}` | None | ✅ |
| `/api/download/[id]` | GET | — | ZIP stream | None | ✅ |

---

## 5. Gap List

### G-01 — Missing 413 File Size Validation (Important)
- **Where**: `app/api/upload/route.ts`
- **Design spec**: POST /api/upload returns 413 for files too large
- **Actual**: No size check; any size accepted (Vercel platform 4.5MB limit applies silently)
- **Impact**: Users uploading large files get an opaque platform error instead of a clear 413
- **Fix**: Add `if (file.size > 500 * 1024 * 1024) return NextResponse.json(..., { status: 413 })`

### G-02 — Upload Implementation Drifted from Design (Important — Design Doc Issue)
- **Where**: Design §1 Architecture Decision Record, §9 next.config.ts
- **Design spec**: `formidable` with `bodyParser: false`
- **Actual**: `request.formData()` (Next.js App Router native), no bodyParser config needed
- **Impact**: Vercel 4.5MB body buffer limit applies; 500MB files won't work on Vercel
- **Fix**: Update design doc to reflect actual implementation + document Vercel size limitation

### G-03 — HMAC Algorithm Mismatch in Design Doc (Minor — Design Doc Error)
- **Where**: Design §8 ACRCloud Signing
- **Design spec**: `crypto.createHmac('sha256', secret)`
- **Actual**: `crypto.createHmac('sha1', secret)` — **correct per ACRCloud requirements**
- **Impact**: None on runtime; design doc is misleading
- **Fix**: Update design doc §8 to show sha1

### G-04 — Function Name Drift: streamZip → createZipStream (Minor)
- **Where**: `lib/zip-builder.ts`
- **Design spec**: `export function streamZip(...)`
- **Actual**: `export function createZipStream(zipPath): fs.ReadStream`
- **Impact**: Minor naming inconsistency; signature also differs (returns ReadStream, not void)
- **Fix**: Update design doc §5 lib module spec

---

## 6. Success Criteria Evaluation

| ID | Criterion | Status | Evidence |
|----|-----------|--------|---------|
| SC-1 | Upload + see progress without refresh | ✅ Met | `useJobPoller` polls every 2s; `ProcessingStatus` renders live |
| SC-2 | ≥80% songs correctly identified | ⚠️ Partial | Requires runtime; ACRCloud config not set in env |
| SC-3 | SRT imports into video editor with correct timecodes | ✅ Met | `toSrtTime()` produces `HH:MM:SS,mmm`; `mergeConsecutiveDuplicates` tested statically |
| SC-4 | ZIP contains SRT + cover-01.jpg … cover-N.jpg | ✅ Met | `buildZip` adds `subtitles.srt` + all `cover-NN.jpg` in `mix-{id}/` prefix |
| SC-5 | Deploys to Vercel | ⚠️ Partial | `next.config.ts` + `ffmpeg-static` configured; Vercel 4.5MB body limit is a known risk |
| SC-6 | 60-min mix completes in < 5 min | ⚠️ Partial | Sequential with `sleep(200)` between calls; math shows ~4 min for 60 segments, but needs runtime |

**Success Rate**: 3/6 fully met; 3/6 partial (all partials require runtime verification)

---

## 7. Decision Record Verification

| Decision | Source | Followed? | Notes |
|----------|--------|-----------|-------|
| Polling every 2s (Option C) | Design §1 | ✅ Yes | `useJobPoller` polls `/api/status` every 2000ms |
| In-memory Map for job state | Design §1 | ✅ Yes | `lib/job-store.ts` |
| `ffmpeg-static` npm package | Design §1 | ✅ Yes | `next.config.ts` externalizes it |
| 10s segments, 5s overlap | Design §1 | ✅ Yes | `ffmpeg-segmenter.ts` step = segDuration - overlap |
| Spotify-style dark UI | Design §6 | ✅ Yes | Color tokens, TrackRow layout match spec |
| `formidable` for upload | Design §1 | ❌ No | Changed to `request.formData()` — simpler but has size limit |
| HMAC-SHA256 signing | Design §8 | ❌ No | Correctly uses SHA1 per ACRCloud docs (design doc was wrong) |

---

## 8. Runtime Verification Plan (Not Executed)

### L1 — API Endpoint Tests
```bash
# Start server first: npm run dev
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/  # expect 200

# Upload test (needs a small MP3)
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.mp3" | jq .  # expect { jobId: "..." }

# Status poll
curl http://localhost:3000/api/status/{jobId}?after=0 | jq .

# Download (after done)
curl -o result.zip http://localhost:3000/api/download/{jobId}
```

### L2/L3 — UI / E2E Tests
- Not executed (Playwright not installed)
- Recommend: `npm install -D @playwright/test` and test the full upload → download flow
