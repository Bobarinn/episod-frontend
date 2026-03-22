'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Plus, Wand2, Film, Palette, Clock, RectangleHorizontal, Mic, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  createProject,
  generateScript,
  listTonePresets,
  listVisualStylePresets,
  type TonePreset,
  type VisualStylePreset,
} from '@/lib/api';
import { cn } from '@/lib/utils';

const DURATION_OPTIONS = [10, 30, 60, 90] as const;
const ASPECT_RATIO_OPTIONS = [
  { value: '9:16', label: '9:16', desc: 'Vertical' },
  { value: '16:9', label: '16:9', desc: 'Landscape' },
] as const;

const VOICE_OPTIONS = [
  { id: '9Dbo4hEvXQ5l7MXGZFQA', name: 'Funmi' },
  { id: 'ZthjuvLPty3kTMaNKVKb', name: 'Peter' },
] as const;

const CUSTOM_VOICE_VALUE = 'custom';

const IMAGE_MODEL_OPTIONS = [
  { value: 'grok' as const, label: 'Grok', desc: 'xAI first, Gemini fallback' },
  { value: 'gemini' as const, label: 'Gemini', desc: 'Gemini first, Grok fallback' },
];

interface CreateProjectSheetProps {
  onProjectCreated: (projectId: string) => void;
}

export default function CreateProjectSheet({ onProjectCreated }: CreateProjectSheetProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [scriptDescription, setScriptDescription] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [tonePresets, setTonePresets] = useState<TonePreset[]>([]);
  const [visualPresets, setVisualPresets] = useState<VisualStylePreset[]>([]);
  const [toneSlug, setToneSlug] = useState<string>('documentary');
  const [visualSlug, setVisualSlug] = useState<string | null>(null);
  const [voiceOption, setVoiceOption] = useState<string>(VOICE_OPTIONS[0].id);
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [imageModel, setImageModel] = useState<'grok' | 'gemini'>('grok');
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPresetsLoading(true);
    Promise.all([listTonePresets(), listVisualStylePresets()])
      .then(([tones, visual]) => {
        const toneList = tones.presets ?? [];
        const visualList = visual.presets ?? [];
        setTonePresets(toneList);
        setVisualPresets(visualList);
        if (toneList.length) {
          setToneSlug(
            toneList.find((p) => p.slug === 'documentary')?.slug ?? toneList[0].slug
          );
        }
        if (visualList.length) {
          setVisualSlug(visualList[0].slug);
        }
      })
      .catch(() => {
        setTonePresets([]);
        setVisualPresets([]);
      })
      .finally(() => setPresetsLoading(false));
  }, [open]);

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      setError('Enter a topic to generate a script');
      return;
    }
    setError('');
    setIsGeneratingScript(true);
    try {
      const { script } = await generateScript({
        topic: topic.trim(),
        description: scriptDescription.trim() || undefined,
        target_duration_seconds: duration,
        tone: toneSlug || undefined,
      });
      setScriptDescription(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const result = await createProject({
        topic: topic.trim(),
        target_duration_seconds: duration,
        aspect_ratio: aspectRatio,
        tone: toneSlug || undefined,
        ...(visualSlug && { graphics_preset_slug: visualSlug }),
        ...(voiceOption === CUSTOM_VOICE_VALUE
          ? (customVoiceId.trim() && { voice_id: customVoiceId.trim() })
          : (voiceOption && { voice_id: voiceOption })),
        image_model: imageModel,
        ...(scriptDescription.trim() && { script_description: scriptDescription.trim() }),
      });
      setTopic('');
      setScriptDescription('');
      setDuration(60);
      setAspectRatio('9:16');
      setVoiceOption(VOICE_OPTIONS[0].id);
      setCustomVoiceId('');
      setImageModel('grok');
      setOpen(false);
      onProjectCreated(result.project_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Video
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col overflow-hidden p-0"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-border/60">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create a Video
            </SheetTitle>
            <SheetDescription>
              Transform any topic into a stunning AI-generated video
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-y-auto"
          >
            <div className="px-6 py-5 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Video Topic</Label>
                <Input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The History of Abraham Lincoln"
                  required
                  disabled={isCreating}
                  className="h-11"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="script">Script or description (optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isCreating || isGeneratingScript || !topic.trim()}
                    onClick={handleGenerateScript}
                    className="shrink-0"
                  >
                    {isGeneratingScript ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-1.5" />
                        Generate script
                      </>
                    )}
                  </Button>
                </div>
                <textarea
                  id="script"
                  value={scriptDescription}
                  onChange={(e) => setScriptDescription(e.target.value)}
                  placeholder="Leave blank for AI to write from the topic, or add a rough draft and click Generate script to expand it."
                  disabled={isCreating}
                  rows={4}
                  className={cn(
                    'flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
                    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50 resize-y'
                  )}
                />
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Duration
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DURATION_OPTIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setDuration(sec)}
                      disabled={isCreating}
                      className={cn(
                        'min-w-[4rem] px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                        duration === sec
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                      )}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect ratio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />
                  Aspect ratio
                </div>
                <div className="flex gap-2">
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAspectRatio(opt.value)}
                      disabled={isCreating}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-0.5 px-4 py-3 rounded-lg text-sm font-medium transition-all border',
                        aspectRatio === opt.value
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image model */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Image model
                </div>
                <div className="flex gap-2">
                  {IMAGE_MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setImageModel(opt.value)}
                      disabled={isCreating}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-0.5 px-4 py-3 rounded-lg text-sm font-medium transition-all border',
                        imageModel === opt.value
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  Voice
                </div>
                <div className="flex gap-2 flex-wrap">
                  {VOICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setVoiceOption(opt.id)}
                      disabled={isCreating}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        voiceOption === opt.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                      )}
                    >
                      {opt.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setVoiceOption(CUSTOM_VOICE_VALUE)}
                    disabled={isCreating}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      voiceOption === CUSTOM_VOICE_VALUE
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    )}
                  >
                    Custom...
                  </button>
                </div>
                {voiceOption === CUSTOM_VOICE_VALUE && (
                  <div className="space-y-1.5">
                    <Input
                      type="text"
                      id="voice-id-custom"
                      value={customVoiceId}
                      onChange={(e) => setCustomVoiceId(e.target.value)}
                      placeholder="Paste ElevenLabs or Cartesia voice ID"
                      disabled={isCreating}
                      className="h-11 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a custom voice ID from ElevenLabs or Cartesia
                    </p>
                  </div>
                )}
              </div>

              {/* Tone presets */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  Tone
                </div>
                {presetsLoading ? (
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-9 w-20 rounded-lg bg-muted/60 animate-pulse"
                      />
                    ))}
                  </div>
                ) : tonePresets.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {tonePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setToneSlug(preset.slug)}
                        disabled={isCreating}
                        title={preset.description}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all text-left max-w-full truncate',
                          toneSlug === preset.slug
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                        )}
                      >
                        {preset.display_name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tone presets available</p>
                )}
              </div>

              {/* Visual style presets */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Visual style
                </div>
                {presetsLoading ? (
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-9 w-24 rounded-lg bg-muted/60 animate-pulse"
                      />
                    ))}
                  </div>
                ) : visualPresets.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {visualPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setVisualSlug(preset.slug)}
                        disabled={isCreating}
                        title={preset.description}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all text-left max-w-full truncate',
                          visualSlug === preset.slug
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                        )}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No visual presets available</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 mt-auto shrink-0 border-t border-border/60 space-y-3 bg-background">
              <Button
                type="submit"
                disabled={isCreating || !topic.trim()}
                className="w-full h-11"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Video
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
