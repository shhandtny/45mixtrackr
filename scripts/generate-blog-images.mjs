import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  console.error('Please set OPENAI_API_KEY in .env.local');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'blog-images');

const posts = [
  {
    slug: 'how-to-identify-songs-in-a-dj-mix',
    prompt: 'A vinyl DJ mixing records on turntables in a dark club, warm orange and amber lighting, close-up of hands on vinyl record, atmospheric moody photo style',
  },
  {
    slug: 'best-45-rpm-adapters-for-vinyl-djs',
    prompt: 'Collection of colorful 45 RPM vinyl record adapters arranged on a dark surface, orange and yellow plastic adapters, product photography style',
  },
  {
    slug: 'how-to-store-vinyl-records-properly',
    prompt: 'Vinyl records stored vertically in wooden shelving, soft warm lighting, organized record collection, cozy music room atmosphere',
  },
  {
    slug: 'turntable-setup-guide-for-beginners',
    prompt: 'A classic turntable record player on a wooden desk with vinyl record, warm ambient lighting, top-down perspective, minimalist style',
  },
  {
    slug: 'vinyl-vs-digital-djing',
    prompt: 'Split composition: vinyl turntable on one side, digital DJ controller on the other, dramatic moody lighting, dark background',
  },
  {
    slug: 'how-to-beatmatch-vinyl-records-by-ear',
    prompt: 'Close-up of DJ hands adjusting pitch slider on turntable, headphones around neck, dark concert lighting, orange glow',
  },
  {
    slug: 'how-to-clean-vinyl-records',
    prompt: 'Vinyl record being cleaned with a soft brush, close-up macro photography, dark background, detailed grooves visible',
  },
  {
    slug: 'best-dj-mixers-for-vinyl',
    prompt: 'Professional DJ mixer with multiple channels and faders on a dark studio desk, glowing buttons and meters, top-down view',
  },
  {
    slug: 'how-to-find-rare-vinyl-records',
    prompt: 'Person flipping through vinyl records in a dimly lit record store, rows of albums, warm dusty atmosphere',
  },
  {
    slug: 'how-to-post-a-dj-mix-on-youtube',
    prompt: 'DJ recording a mix session with camera setup, computer screen showing waveform, studio environment, warm lighting',
  },
  {
    slug: 'best-turntables-for-beginners',
    prompt: 'Several modern turntables displayed on a clean surface, product photography, dark background, orange accent lighting',
  },
  {
    slug: 'how-to-create-a-dj-mix-tracklist',
    prompt: 'Handwritten tracklist on paper next to vinyl records and headphones, flat lay photography, dark moody background',
  },
  {
    slug: 'what-is-audio-fingerprinting',
    prompt: 'Abstract visualization of audio waveform being scanned and matched, glowing lines and patterns, dark tech aesthetic, orange and blue colors',
  },
  {
    slug: 'best-vinyl-record-shops-worldwide',
    prompt: 'Iconic record shop interior with floor-to-ceiling vinyl shelves, warm lighting, vintage atmosphere, people browsing records',
  },
  {
    slug: 'how-to-mix-different-genres-on-vinyl',
    prompt: 'Two contrasting vinyl records side by side on a turntable, abstract genre collision concept, dramatic lighting',
  },
  {
    slug: '3d-printed-45rpm-record-adapters-vinyl-djs',
    prompt: '3D printed orange plastic 45 RPM vinyl adapters on a dark surface, product photography, crisp detail, modern design',
  },
  {
    slug: '3d-printed-7-inch-vinyl-storage-box-translucent',
    prompt: 'Translucent 3D printed storage box containing 7-inch vinyl records, clean product photography, dark background, modern minimalist',
  },
  {
    slug: '3d-printed-vinyl-storage-box-premium-customizable',
    prompt: 'Premium 3D printed customizable vinyl record storage box, sleek modern design, dark studio photography, orange accent lighting',
  },
  {
    slug: 'how-to-get-tracklist-from-dj-mix',
    prompt: 'A smartphone screen showing a song identification app with tracklist results, DJ mixer in background, dark moody lighting, orange accent glow',
  },
  {
    slug: 'how-to-add-song-titles-to-dj-mix-video',
    prompt: 'Video editing software timeline with subtitle text overlay showing song titles, dark professional workstation setup, monitor glow, cinematic style',
  },
  {
    slug: 'how-to-download-album-covers-for-dj-sets',
    prompt: 'Grid of colorful vinyl record album covers arranged neatly on a dark surface, diverse music genres, top-down photography, warm lighting',
  },
];

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json.data[0].url);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Generating ${posts.length} blog images with DALL-E 3...\n`);

  for (const post of posts) {
    const filename = `${post.slug}.jpg`;
    const dest = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(dest)) {
      console.log(`✓ Skipping ${post.slug} (already exists)`);
      continue;
    }

    try {
      process.stdout.write(`Generating: ${post.slug}...`);
      const url = await generateImage(post.prompt);
      await downloadImage(url, dest);
      console.log(' done');
    } catch (err) {
      console.error(` FAILED: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nAll done! Images saved to public/blog-images/');
}

main();
