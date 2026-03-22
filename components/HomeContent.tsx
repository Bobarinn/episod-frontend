'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RefreshCw, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import CreateProjectSheet from '@/components/CreateProjectSheet';
import ProjectCard from '@/components/ProjectCard';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Project, listProjects, type ProjectStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | ProjectStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'queued', label: 'Queued' },
  { value: 'planning', label: 'Planning' },
  { value: 'generating', label: 'Generating' },
  { value: 'rendering', label: 'Rendering' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalProjects, setTotalProjects] = useState(0);

  const statusFromUrl = searchParams.get('status') as StatusFilter | null;
  const statusFilter =
    statusFromUrl && STATUS_FILTER_OPTIONS.some((o) => o.value === statusFromUrl)
      ? statusFromUrl
      : 'all';

  const loadProjects = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const response = await listProjects(50, 0, {
          ...(statusFilter !== 'all' && { status: statusFilter }),
        });
        setProjects(response.projects);
        setTotalProjects(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasActive = projects.some(
        (p) => !['completed', 'failed'].includes(p.status)
      );
      if (hasActive) loadProjects(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [projects.length, loadProjects]);

  const handleStatusChange = (value: StatusFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') params.delete('status');
    else params.set('status', value);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : '/');
  };

  const handleProjectCreated = (projectId: string) => {
    loadProjects(false);
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">
                {totalProjects > 0 ? `Projects (${totalProjects})` : 'Your Projects'}
              </h2>
              {projects.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {projects.length} of {totalProjects}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="status-filter" className="text-sm font-medium text-muted-foreground">
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
                className={cn(
                  'h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadProjects(false)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {loading && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Loading your projects...
              </p>
            </div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg shadow-sm p-12 text-center"
            >
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load Projects</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => loadProjects(false)}>Try Again</Button>
            </motion.div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProjectCard project={project} href={`/projects/${project.id}`} />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Create your first AI-generated video to get started
              </p>
              <CreateProjectSheet onProjectCreated={handleProjectCreated} />
            </motion.div>
          )}
        </section>
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by GPT-5-mini • Gemini • ElevenLabs • Whisper • xAI Grok • FFmpeg
          </p>
        </div>
      </footer>
    </div>
  );
}
