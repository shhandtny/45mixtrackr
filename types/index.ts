// Design Ref: §2 — Core data models for the dj-cover-downloader pipeline

export type JobStatus =
  | 'uploading'
  | 'segmenting'
  | 'identifying'
  | 'packaging'
  | 'done'
  | 'error';

export interface Track {
  /** 1-based position in the mix */
  index: number;
  title: string;
  artist: string;
  album: string;
  /** Seconds from start of recording */
  startTime: number;
  /** Seconds from start of recording */
  endTime: number;
  /** Remote cover image URL from ACRCloud response (null if unrecognized) */
  coverUrl: string | null;
  /** Filename written to ZIP, e.g. "cover-01.jpg" */
  coverFilename: string;
  /** false = unidentified segment, shown as grey placeholder row */
  recognized: boolean;
}

export interface Job {
  id: string;
  status: JobStatus;
  /** Absolute path to uploaded file, e.g. /tmp/{id}/input.mp3 */
  inputPath: string;
  /** Working directory for this job, e.g. /tmp/{id}/ */
  workDir: string;
  tracks: Track[];
  totalSegments: number;
  processedSegments: number;
  error?: string;
  createdAt: number;
  userId?: string;
  fileName?: string;
}

// ACRCloud REST API response shape
// Design Ref: §6 — ACRCloud Integration

export interface ACRCloudMusicEntry {
  title: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  /** Direct cover image URL returned by ACRCloud */
  cover_image_url?: string;
  external_metadata?: {
    spotify?: {
      album?: {
        images?: Array<{ url: string; width: number; height: number }>;
      };
    };
  };
  /** Offset of the matched audio within the original recording (ms) */
  play_offset_ms: number;
  duration_ms: number;
}

export interface ACRCloudResult {
  status: { code: number; msg: string };
  metadata?: {
    music: ACRCloudMusicEntry[];
  };
}

// API response shapes

export interface StatusResponse {
  status: JobStatus;
  step: string;
  processedSegments: number;
  totalSegments: number;
  tracks: Track[];
  error?: string;
}

export interface UploadResponse {
  jobId: string;
}
