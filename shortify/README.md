# MyShort — real local pipeline

MyShort converts an authorized YouTube source into actual vertical MP4 files. The previous simulated jobs and seeded results have been removed.

## What is real

1. A rights-confirmed YouTube URL creates a filesystem-backed job.
2. The Python worker obtains the permitted public source using `yt-dlp`.
3. `ffprobe` verifies the source duration.
4. `faster-whisper` performs local speech-to-text with VAD.
5. A deterministic highlight scorer selects strong, complete, non-overlapping moments.
6. FFmpeg cuts each moment, reframes it vertically, burns precisely sized ASS captions, encodes H.264/AAC, and generates a thumbnail.
7. Captions use 2–4 word phrases, safe-area placement, and an embedded multilingual Devanagari-capable font.
8. The website previews actual files and offers individual MP4 or ZIP downloads.
9. Worker heartbeats expose live ready/busy/offline status and prevent jobs from waiting on an unavailable worker.
10. Failed jobs show the real worker error instead of fake completion.

## Requirements

- Docker and Docker Compose
- Adequate disk space
- At least 4 GB RAM for the default Whisper `small` model; more CPU improves speed
- Network access from the worker to YouTube
- Only videos the user owns or has permission to process

## Start

```bash
docker compose up --build
```

Open `http://localhost:5173`.

The first transcription downloads the configured Whisper model. Use a smaller model on limited hardware:

```bash
WHISPER_MODEL=base docker compose up --build
```

## Configuration

- `WHISPER_MODEL`: `tiny`, `base`, `small`, `medium`, or a compatible faster-whisper model (`small` default)
- `COMPUTE_TYPE`: `int8` for CPU; use an appropriate CUDA configuration for GPU deployments
- Source duration and clip quantity are not capped by the application; available compute and storage determine practical capacity.
- `YTDLP_COOKIES_FILE`: optional path inside the worker container for content that the authorized user can access. Do not use it to bypass access restrictions.

Persistent Docker volumes:

- `myshort_data`: project records, queue, and temporary processing files
- `myshort_media`: completed MP4s and thumbnails

## Operational notes

- YouTube may block or change media delivery at any time. The worker does not bypass DRM, private-video access, paywalls, or technical protections.
- The current local pipeline uses a centered 9:16 crop. Speaker tracking is not falsely advertised.
- Edited re-rendering is intentionally disabled until a source-retention policy and render queue are configured.
- This Docker setup is a single-host deployment. Multi-node production requires PostgreSQL, Redis, object storage, authentication, rate limits, and isolated workers.

## API

- `GET /api/health`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/projects/:id/clips`
- `GET /api/projects/:id/download-all`
- `DELETE /api/projects/:id`

## Development UI

```bash
npm install
npm run build
npm start
```

This starts the website/API, but actual processing also requires `python3 worker.py` with FFmpeg and the Python requirements installed. Docker Compose is the supported complete setup.
