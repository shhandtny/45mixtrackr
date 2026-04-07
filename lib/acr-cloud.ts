// Design Ref: §5 lib/acr-cloud.ts — ACRCloud REST API wrapper
// Design Ref: §8 ACRCloud Signing — HMAC-SHA1 per ACRCloud docs
// Plan SC: each recognized song returns title, artist, album, cover URL

import crypto from 'crypto';
import FormData from 'form-data';
import type { ACRCloudResult, ACRCloudMusicEntry } from '@/types';

interface ACRCloudConfig {
  host: string;
  accessKey: string;
  accessSecret: string;
}

function buildSignature(
  method: string,
  uri: string,
  accessKey: string,
  dataType: string,
  signatureVersion: string,
  timestamp: string,
  secret: string
): string {
  const stringToSign = [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  return crypto
    .createHmac('sha1', secret)
    .update(stringToSign)
    .digest('base64');
}

/**
 * Send a 10-second audio buffer to ACRCloud for identification.
 * Returns the raw ACRCloud response.
 */
export async function identifySegment(
  audioBuffer: Buffer,
  config: ACRCloudConfig
): Promise<ACRCloudResult> {
  const { host, accessKey, accessSecret } = config;
  const uri = '/v1/identify';
  const dataType = 'audio';
  const signatureVersion = '1';
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = buildSignature(
    'POST',
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp,
    accessSecret
  );

  const form = new FormData();
  form.append('sample', audioBuffer, {
    filename: 'sample.mp3',
    contentType: 'audio/mpeg',
  });
  form.append('sample_bytes', String(audioBuffer.length));
  form.append('access_key', accessKey);
  form.append('data_type', dataType);
  form.append('signature_version', signatureVersion);
  form.append('signature', signature);
  form.append('timestamp', timestamp);

  const url = `https://${host}${uri}`;
  // Buffer the multipart body so native fetch gets a concrete Buffer with a
  // known Content-Length rather than a stream it may not handle correctly.
  const formBuffer = form.getBuffer();
  const response = await fetch(url, {
    method: 'POST',
    body: formBuffer.buffer.slice(
      formBuffer.byteOffset,
      formBuffer.byteOffset + formBuffer.byteLength
    ) as ArrayBuffer,
    headers: {
      ...form.getHeaders(),
      'Content-Length': String(formBuffer.length),
    },
  });

  if (!response.ok) {
    throw new Error(`ACRCloud HTTP ${response.status}: ${await response.text()}`);
  }

  const result = await response.json() as ACRCloudResult;
  if (result.status.code !== 0) {
    console.log('[ACRCloud]', result.status.code, result.status.msg);
  }
  return result;
}

/**
 * Extract the best cover image URL from an ACRCloud music entry.
 * Prefers Spotify images (higher quality), falls back to null.
 */
function extractCoverUrl(entry: ACRCloudMusicEntry): string | null {
  // Prefer Spotify images (higher resolution)
  const images = entry.external_metadata?.spotify?.album?.images;
  if (images && images.length > 0) {
    const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    return sorted[0].url;
  }
  // Fall back to ACRCloud's own cover_image_url
  if (entry.cover_image_url) {
    return entry.cover_image_url;
  }
  return null;
}

/**
 * Parse the top music match from an ACRCloud result.
 * Returns null if the segment was not recognized (status code != 0).
 */
export function extractTrackMeta(result: ACRCloudResult): {
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
} | null {
  // ACRCloud status code 0 = success
  if (result.status.code !== 0) return null;

  const music = result.metadata?.music;
  if (!music || music.length === 0) return null;

  const entry = music[0];
  return {
    title: entry.title ?? 'Unknown Title',
    artist: entry.artists?.[0]?.name ?? 'Unknown Artist',
    album: entry.album?.name ?? '',
    coverUrl: extractCoverUrl(entry),
  };
}

export type { ACRCloudConfig };
