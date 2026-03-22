import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/lib/api';
import StatusBadge from './StatusBadge';
import { Clock, Film, Play } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  href?: string;
  onClick?: () => void;
}

export default function ProjectCard({ project, href, onClick }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cardContent = (
    <>
      {/* 9:16 Portrait Container */}
      <div className="aspect-[9/16] relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-lg group-hover:ring-black/10">
        {/* Thumbnail Background */}
        {project.thumbnail_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${project.thumbnail_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={project.status} />
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 leading-tight">
            {project.topic}
          </h3>

          <div className="flex items-center gap-3 text-xs text-white/80 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{project.target_duration_seconds}s</span>
            </div>

            {project.clip_count !== undefined && project.clip_count > 0 && (
              <div className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                <span>{project.clip_count} clips</span>
              </div>
            )}
          </div>

          <div className="text-xs text-white/60">
            {formatDate(project.created_at)}
          </div>

          {/* Completed Indicator */}
          {project.status === 'completed' && project.final_video_url && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                <Play className="h-3 w-3" />
                <span>Ready to watch</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 bg-black/20 backdrop-blur-[2px]">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    </>
  );

  const className = 'group relative w-full text-left';

  if (href) {
    return (
      <Link href={href}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4 }}
          className={className}
        >
          {cardContent}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={className}
    >
      {cardContent}
    </motion.button>
  );
}
