// All requests go through the Next.js API proxy at /api/proxy/*
// The proxy injects the API key server-side so it never reaches the browser.
const PROXY_BASE = '/api/proxy';

// Types
export type ProjectStatus = 'queued' | 'planning' | 'generating' | 'rendering' | 'completed' | 'failed';

export interface Clip {
  id: string;
  project_id: string;
  clip_index: number;
  script: string;
  voice_style_instruction: string;
  image_prompt: string;
  video_prompt: string;
  status: string;
  audio_asset_id?: string;
  image_asset_id?: string;
  clip_video_asset_id?: string;
  audio_duration_ms?: number;
  audio_url?: string;
  image_url?: string;
  clip_video_url?: string;
}

export interface GraphicsPreset {
  id: string;
  name: string;
  style_json: Record<string, any>;
  prompt_addition: string;
}

export interface Project {
  id: string;
  topic: string;
  target_duration_seconds: number;
  status: ProjectStatus;
  plan_version?: number;
  created_at: string;
  updated_at: string;
  clips?: Clip[];
  graphics_preset?: GraphicsPreset;
  final_video_asset_id?: string;
  final_video_url?: string;
  thumbnail_url?: string;
  clip_count?: number;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
}

export interface Job {
  id: string;
  project_id: string;
  clip_id?: string;
  type: string;
  status: string;
  attempts: number;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  error_message?: string;
}

export interface TonePreset {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface VisualStylePreset {
  id: string;
  slug: string;
  name: string;
  description: string;
  style_json: Record<string, unknown>;
  prompt_addition: string;
  created_at: string;
  updated_at: string;
}

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${PROXY_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const url = `${PROXY_BASE}/health`;

  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) {
    return { status: 'ok' };
  }
  try {
    const data = JSON.parse(text) as { status?: string };
    return { status: data.status ?? 'ok' };
  } catch {
    return { status: 'ok' };
  }
};

/** Image model for generation: "grok" (xAI first, Gemini fallback) or "gemini" (Gemini first, Grok fallback) */
export type ImageModel = 'grok' | 'gemini';

export interface CreateProjectOptions {
  topic: string;
  target_duration_seconds?: number;
  script_description?: string;
  graphics_preset_id?: string;
  graphics_preset_slug?: string;
  series_id?: string;
  tone?: string;
  aspect_ratio?: string;
  animation_mode?: string;
  voice_id?: string;
  image_model?: ImageModel;
  cta?: string;
  music_mood?: string;
  sample_image_url?: string;
  language?: string;
}

export const createProject = async (
  topicOrOptions: string | CreateProjectOptions,
  targetDuration?: number
): Promise<{ project_id: string; status: string }> => {
  const body =
    typeof topicOrOptions === 'string'
      ? { topic: topicOrOptions, target_duration_seconds: targetDuration ?? 105 }
      : {
          topic: topicOrOptions.topic,
          target_duration_seconds: topicOrOptions.target_duration_seconds ?? 105,
          ...(topicOrOptions.script_description != null && { script_description: topicOrOptions.script_description }),
          ...(topicOrOptions.graphics_preset_id != null && { graphics_preset_id: topicOrOptions.graphics_preset_id }),
          ...(topicOrOptions.graphics_preset_slug != null && { graphics_preset_slug: topicOrOptions.graphics_preset_slug }),
          ...(topicOrOptions.series_id != null && { series_id: topicOrOptions.series_id }),
          ...(topicOrOptions.tone != null && { tone: topicOrOptions.tone }),
          ...(topicOrOptions.aspect_ratio != null && { aspect_ratio: topicOrOptions.aspect_ratio }),
          ...(topicOrOptions.animation_mode != null && { animation_mode: topicOrOptions.animation_mode }),
          ...(topicOrOptions.voice_id != null && { voice_id: topicOrOptions.voice_id }),
          ...(topicOrOptions.image_model != null && { image_model: topicOrOptions.image_model }),
          ...(topicOrOptions.cta != null && { cta: topicOrOptions.cta }),
          ...(topicOrOptions.music_mood != null && { music_mood: topicOrOptions.music_mood }),
          ...(topicOrOptions.sample_image_url != null && { sample_image_url: topicOrOptions.sample_image_url }),
          ...(topicOrOptions.language != null && { language: topicOrOptions.language }),
        };
  return apiRequest('/v1/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export interface GenerateScriptOptions {
  topic: string;
  description?: string;
  target_duration_seconds?: number;
  tone?: string;
  language?: string;
}

export const generateScript = async (
  options: GenerateScriptOptions
): Promise<{ script: string }> => {
  const body = {
    topic: options.topic,
    ...(options.description != null && options.description.trim() !== '' && { description: options.description.trim() }),
    ...(options.target_duration_seconds != null && { target_duration_seconds: options.target_duration_seconds }),
    ...(options.tone != null && { tone: options.tone }),
    ...(options.language != null && { language: options.language }),
  };
  return apiRequest('/v1/generate-script', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getProject = async (id: string): Promise<Project> => {
  return apiRequest(`/v1/projects/${id}`);
};

export const getDownloadUrl = async (id: string): Promise<string> => {
  const url = `${PROXY_BASE}/v1/projects/${id}/download`;

  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error('Download not ready');
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error('Download not ready');
  }

  return data.url;
};

export const getDebugJobs = async (id: string): Promise<Job[]> => {
  return apiRequest(`/v1/projects/${id}/debug/jobs`);
};

export const getClip = async (projectId: string, clipId: string): Promise<Clip> => {
  return apiRequest(`/v1/projects/${projectId}/clips/${clipId}`);
};

/** List projects. Limit max 100 per backend. Status filter: queued | planning | generating | rendering | completed | failed */
export const listProjects = async (
  limit = 20,
  offset = 0,
  options?: { status?: ProjectStatus }
): Promise<ProjectListResponse> => {
  const params = new URLSearchParams();
  params.set('limit', String(Math.min(limit, 100)));
  params.set('offset', String(offset));
  if (options?.status) {
    params.set('status', options.status);
  }
  return apiRequest(`/v1/projects?${params.toString()}`);
};

export const listTonePresets = async (): Promise<{ presets: TonePreset[]; count: number }> => {
  return apiRequest('/v1/presets/tones');
};

export const listVisualStylePresets = async (): Promise<{
  presets: VisualStylePreset[];
  count: number;
}> => {
  return apiRequest('/v1/presets/visual-styles');
};
