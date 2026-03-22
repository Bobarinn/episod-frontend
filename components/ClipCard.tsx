import { motion } from 'framer-motion';
import { Clip } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Image as ImageIcon, Video, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ClipCardProps {
  clip: Clip;
  index: number;
}

export default function ClipCard({ clip, index }: ClipCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {clip.clip_index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Clip {clip.clip_index + 1}
            </span>
            <Badge variant={clip.status === 'rendered' ? 'default' : 'secondary'} className="text-xs">
              {clip.status}
            </Badge>
          </div>
          <p className="text-sm text-foreground line-clamp-2">
            {clip.script}
          </p>
        </div>
      </div>

      {clip.audio_duration_ms && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5" />
          <span>{(clip.audio_duration_ms / 1000).toFixed(1)}s</span>
        </div>
      )}

      <div className="flex gap-2">
        {clip.audio_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 text-xs"
          >
            <a href={clip.audio_url} target="_blank" rel="noopener noreferrer">
              <Music className="h-3.5 w-3.5 mr-1.5" />
              Audio
            </a>
          </Button>
        )}
        {clip.image_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 text-xs"
          >
            <a href={clip.image_url} target="_blank" rel="noopener noreferrer">
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Image
            </a>
          </Button>
        )}
        {clip.clip_video_url && (
          <Button
            variant="default"
            size="sm"
            asChild
            className="flex-1 text-xs"
          >
            <a href={clip.clip_video_url} target="_blank" rel="noopener noreferrer">
              <Video className="h-3.5 w-3.5 mr-1.5" />
              Video
            </a>
          </Button>
        )}
      </div>

      {(clip.image_prompt || clip.video_prompt || clip.voice_style_instruction) && (
        <div className="mt-3 pt-3 border-t">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span>{showDetails ? 'Hide' : 'View'} Prompts</span>
          </button>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 text-xs"
            >
              {clip.image_prompt && (
                <div>
                  <div className="font-semibold text-muted-foreground mb-1">Image Prompt</div>
                  <div className="text-foreground/80">{clip.image_prompt}</div>
                </div>
              )}
              {clip.video_prompt && (
                <div>
                  <div className="font-semibold text-muted-foreground mb-1">Video Prompt</div>
                  <div className="text-foreground/80">{clip.video_prompt}</div>
                </div>
              )}
              {clip.voice_style_instruction && (
                <div>
                  <div className="font-semibold text-muted-foreground mb-1">Voice Style</div>
                  <div className="text-foreground/80">{clip.voice_style_instruction}</div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
