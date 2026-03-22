# API: Create project, generate script, curl and responses

## Base URL

- **Default / Production:** `https://video.xophie.ai`
- **Development (local backend):** `http://localhost:8080`

If `BACKEND_API_KEY` is set, send either **`X-API-Key: YOUR_API_KEY`** or **`Authorization: Bearer YOUR_API_KEY`** on all requests.

---

## 1. Create project

**Endpoint:** `POST /v1/projects`  
**Content-Type:** `application/json`

### Request body (CreateProjectRequest)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | **yes** | Main topic (e.g. "The History of Coffee") |
| `target_duration_seconds` | int | no | Target length in seconds (default: 60) |
| `graphics_preset_id` | UUID | no | Preset by ID |
| `graphics_preset_slug` | string | no | Preset by slug (e.g. `"hyper_realistic"`) |
| `series_id` | UUID | no | Optional series |
| `tone` | string | no | e.g. `"documentary"`, `"dramatic"` (default: `"documentary"`) |
| `aspect_ratio` | string | no | e.g. `"9:16"`, `"16:9"` (default: `"9:16"`) |
| `animation_mode` | string | no | `"xai_video"`, `"subject_motion"`, `"ken_burns"`, `"auto"` (default: `"subject_motion"`) |
| `voice_id` | string | no | ElevenLabs voice ID (default: from env) |
| `image_model` | string | no | `"grok"` = xAI Grok first (Gemini fallback). `"gemini"` = Gemini first (Grok fallback). Default: `"grok"`. |
| `cta` | string | no | Call-to-action for last clip |
| `music_mood` | string | no | e.g. `"calm"`, `"epic"` |
| `sample_image_url` | string | no | Custom style reference image URL |
| `language` | string | no | ISO 639-1, e.g. `"en"` (default: `"en"`) |
| `script_description` | string | no | Full or rough script; used by OpenAI to generate the plan (e.g. story, "about me" text) |

### curl – minimal (topic only)

```bash
curl -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"topic": "The Amazing History of Coffee"}'
```

### curl – with options

```bash
curl -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Science Behind Lucid Dreams",
    "target_duration_seconds": 120,
    "graphics_preset_slug": "hyper_realistic",
    "tone": "documentary",
    "language": "en"
  }'
```

### curl – with script (e.g. "about me" or story)

Use `script_description` when you already have a draft (from **Generate Script** or written by the user). The backend uses it as the basis for the plan.

```bash
curl -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "My journey as a founder",
    "script_description": "I started in a garage with two friends. We had no funding, just an idea. This is the story of how we got our first 1000 users.",
    "target_duration_seconds": 90,
    "tone": "documentary",
    "language": "en"
  }'
```

### Response – 201 Created (CreateProjectResponse)

```json
{
  "project_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "queued"
}
```

### Error responses

- **400** – Missing topic: `{"error": "Topic is required"}`
- **400** – Invalid preset: `{"error": "Invalid graphics_preset_slug: preset not found"}`
- **500** – `{"error": "Failed to create project"}` or `"Failed to enqueue job"`

---

## 2. Generate script (no project)

**Endpoint:** `POST /v1/generate-script`  
**Content-Type:** `application/json`

Returns **one combined script** for the whole story. It does **not** create a project or return clips/prompts. Use it so the user can get a draft, edit it, then create a project with **POST /v1/projects** and `script_description` set to that script.

Requires **OpenAI** (`OPENAI_API_KEY` set). If `BACKEND_API_KEY` is set, include the API key header.

### Request body (GenerateScriptRequest)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | **yes** | Main topic |
| `description` | string | no | Rough description or draft script to expand |
| `target_duration_seconds` | int | no | Hint for length in seconds (default: 60) |
| `tone` | string | no | e.g. `"documentary"`, `"dramatic"` (default: `"documentary"`) |
| `language` | string | no | ISO 639-1 (default: `"en"`) |

### curl – full body

```bash
curl -X POST http://localhost:8080/v1/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The history of the Roman Empire",
    "description": "Focus on the rise of Augustus and the transition from Republic to Empire. Keep it educational but engaging.",
    "target_duration_seconds": 60,
    "tone": "documentary",
    "language": "en"
  }'
```

### curl – topic only

```bash
curl -X POST http://localhost:8080/v1/generate-script \
  -H "Content-Type: application/json" \
  -d '{"topic": "Why we need more sleep"}'
```

### Response – 200 OK (GenerateScriptResponse)

One string in `script`:

```json
{
  "script": "In 27 BC, the Roman Republic gave way to the Roman Empire when the Senate granted Octavian the title Augustus. He had emerged victorious from years of civil war, and his reign would transform Rome with massive building projects and a long period of peace known as the Pax Romana..."
}
```

### Error responses

- **400** – `{"error": "topic is required"}` or `"Invalid request body"}`
- **503** – No OpenAI: `{"error": "Script generation is not configured (missing OpenAI API key)"}`
- **500** – `{"error": "Failed to generate script: ..."}`

---

## 3. List projects

**Endpoint:** `GET /v1/projects`

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | (none) | Filter: `queued`, `planning`, `generating`, `rendering`, `completed`, `failed` |
| `limit` | int | 20 (max 100) | Page size |
| `offset` | int | 0 | Skip N projects |

### curl — all projects

```bash
curl "http://localhost:8080/v1/projects"

# With auth:
curl -H "X-API-Key: YOUR_KEY" "https://video.xophie.ai/v1/projects"
```

### curl — with pagination and filter

```bash
curl "http://localhost:8080/v1/projects?limit=50&offset=0&status=completed"
```

### Response (200 OK) — ListProjectsResponse

```json
{
  "projects": [
    {
      "id": "b961fd08-612c-4667-b0e3-4339e7bad8c8",
      "topic": "The Amazing History of Coffee",
      "target_duration_seconds": 90,
      "tone": "documentary",
      "language": "en",
      "status": "completed",
      "thumbnail_url": "https://your-bucket.s3.us-east-1.amazonaws.com/...",
      "final_video_url": "https://your-bucket.s3.us-east-1.amazonaws.com/...",
      "clip_count": 4,
      "error_code": null,
      "error_message": null,
      "created_at": "2026-02-16T17:30:00Z",
      "updated_at": "2026-02-16T17:36:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Each item in `projects` is a **ProjectSummary** (no `clips` array). For full clip details use **GET /v1/projects/{id}**.

### Response — empty

```json
{
  "projects": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

---

## 4. How to use them

### Workflow A: Topic only → create project

1. Create project with a topic; worker generates plan and clips.
2. Poll **GET /v1/projects/{id}** until `status` is `completed` or `failed`.
3. Use `final_video_url` or **GET /v1/projects/{id}/download** to get the video.

```bash
# 1) Create
RESPONSE=$(curl -s -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"topic": "The Rise of AI", "target_duration_seconds": 90}')
PROJECT_ID=$(echo $RESPONSE | jq -r '.project_id')

# 2) Poll (response is flat: .status, .id, .clips, .final_video_url)
while true; do
  STATUS=$(curl -s "http://localhost:8080/v1/projects/$PROJECT_ID" | jq -r '.status')
  echo "Status: $STATUS"
  [ "$STATUS" = "completed" ] && break
  [ "$STATUS" = "failed" ] && { curl -s "http://localhost:8080/v1/projects/$PROJECT_ID/debug/jobs" | jq .; exit 1; }
  sleep 10
done

# 3) Download
curl -L "http://localhost:8080/v1/projects/$PROJECT_ID/download" -o my_video.mp4
```

### Workflow B: Generate script → user edits → create project

1. Call **POST /v1/generate-script** with topic (and optional `description`).
2. Show the returned `script` in your UI; user edits it.
3. Call **POST /v1/projects** with the same topic and `script_description` set to the (edited) script.

```bash
# 1) Get draft script
SCRIPT_RESPONSE=$(curl -s -X POST http://localhost:8080/v1/generate-script \
  -H "Content-Type: application/json" \
  -d '{"topic": "My startup story", "target_duration_seconds": 90}')
echo "$SCRIPT_RESPONSE" | jq -r '.script'
# (User edits the script in your app)

# 2) Create project using the edited script (paste into script_description)
EDITED_SCRIPT="I started in a garage. We had no funding..."
curl -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -d "{
    \"topic\": \"My startup story\",
    \"script_description\": $(echo "$SCRIPT_RESPONSE" | jq '.script'),
    \"target_duration_seconds\": 90
  }"
# Then poll and download as in Workflow A
```

### Get project (for polling and status)

```bash
curl -s "http://localhost:8080/v1/projects/$PROJECT_ID"
```

Response is **flat** (embedded project): `id`, `topic`, `status`, `target_duration_seconds`, `clips`, `final_video_url`, `graphics_preset`, etc. Use **`.status`** (not `.project.status`) when polling.

---

## 5. Preset endpoints

Use these to populate tone and visual-style options in the UI. Send `X-API-Key` or `Authorization: Bearer <key>` when `BACKEND_API_KEY` is set.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/presets/tones` | GET | List tone presets; use `slug` as `tone` in create project / generate script |
| `/v1/presets/visual-styles` | GET | List graphics presets; use `id` as `graphics_preset_id` or `slug` as `graphics_preset_slug` in create project |

Both return **200** with `presets` (array) and `count` (number). On error: **500** with `{"error": "..."}`.

---

## 6. Quick reference

| Action | Method | Endpoint | Body / response |
|--------|--------|----------|------------------|
| Create project | POST | `/v1/projects` | Body: `topic` (required), optional fields above. Response: `project_id`, `status` |
| Generate script | POST | `/v1/generate-script` | Body: `topic` (required), optional `description`, `target_duration_seconds`, `tone`, `language`. Response: `script` |
| List projects | GET | `/v1/projects` | Query: `status`, `limit` (max 100), `offset`. Response: `projects`, `total`, `limit`, `offset` |
| Tone presets | GET | `/v1/presets/tones` | Response: `presets`, `count` |
| Visual style presets | GET | `/v1/presets/visual-styles` | Response: `presets`, `count` |
| Get project | GET | `/v1/projects/{id}` | Response: project + `clips`, `final_video_url`, `graphics_preset` |
| Download video | GET | `/v1/projects/{id}/download` | 307 to signed URL; use `curl -L` to follow |
| Debug jobs | GET | `/v1/projects/{id}/debug/jobs` | List of jobs (type, status, error_message) |
