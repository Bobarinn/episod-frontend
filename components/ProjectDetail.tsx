'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, AlertCircle, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project, getProject, getDebugJobs, Job, getDownloadUrl } from '@/lib/api';
import StatusBadge from './StatusBadge';
import ClipCard from './ClipCard';
import VideoPlayer from './VideoPlayer';

interface ProjectDetailProps {
  projectId: string;
  onClose: () => void;
}

export default function ProjectDetail({ projectId, onClose }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadProject();
    const interval = setInterval(() => {
      if (project && !['completed', 'failed'].includes(project.status)) {
        loadProject();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId, project?.status]);

  const loadProject = async () => {
    try {
      const data = await getProject(projectId);
      setProject(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadDebugJobs = async () => {
    try {
      const data = await getDebugJobs(projectId);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load debug jobs:', err);
    }
  };

  const handleDownload = async () => {
    if (!project?.final_video_url) return;

    setDownloading(true);
    try {
      const url = project.final_video_url || await getDownloadUrl(projectId);
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const toggleDebug = () => {
    if (!showDebug) {
      loadDebugJobs();
    }
    setShowDebug(!showDebug);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border rounded-lg shadow-sm p-20 text-center"
      >
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Loading project...</p>
      </motion.div>
    );
  }

  if (error || !project) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border rounded-lg shadow-sm p-12 text-center"
      >
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Project</h3>
        <p className="text-muted-foreground mb-6">{error || 'Project not found'}</p>
        <Button onClick={onClose}>Go Back</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card border rounded-lg shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b">
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
            {project.topic}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <Badge variant="outline" className="text-xs">
              {project.target_duration_seconds}s target
            </Badge>
            {project.clips && (
              <Badge variant="outline" className="text-xs">
                {project.clips.length} clips
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Video Player */}
        {project.status === 'completed' && project.final_video_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <VideoPlayer
              src={project.final_video_url}
              className="aspect-[9/16] max-w-sm mx-auto bg-black rounded-lg overflow-hidden shadow-lg"
            />
            <div className="text-center mt-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Video
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {!['completed', 'failed'].includes(project.status) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <div className="font-semibold text-blue-900 text-sm">Processing...</div>
                <div className="text-xs text-blue-700 mt-0.5">
                  Your video is being generated. This page updates automatically.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clips */}
        {project.clips && project.clips.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Clips ({project.clips.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {project.clips.map((clip, index) => (
                <ClipCard key={clip.id} clip={clip} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Debug Section */}
        <div className="border-t pt-6">
          <Button
            variant="outline"
            onClick={toggleDebug}
            className="w-full"
          >
            <Bug className="mr-2 h-4 w-4" />
            <span>{showDebug ? 'Hide' : 'View'} Debug Jobs</span>
            {showDebug ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>

          <AnimatePresence>
            {showDebug && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 overflow-hidden"
              >
                {jobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No debug jobs available
                  </div>
                ) : (
                  jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {job.type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            <div>Attempts: {job.attempts}</div>
                            {job.started_at && (
                              <div>Started: {new Date(job.started_at).toLocaleString()}</div>
                            )}
                            {job.finished_at && (
                              <div>Finished: {new Date(job.finished_at).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            job.status === 'succeeded'
                              ? 'default'
                              : job.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                      </div>
                      {job.error_message && (
                        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mt-2">
                          {job.error_message}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
