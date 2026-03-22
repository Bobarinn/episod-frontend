import { ProjectStatus } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Clock, Brain, Sparkles, Film, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ProjectStatus;
  showIcon?: boolean;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  queued: { label: 'Queued', icon: Clock },
  planning: { label: 'Planning', icon: Brain },
  generating: { label: 'Generating', icon: Sparkles },
  rendering: { label: 'Rendering', icon: Film },
  completed: { label: 'Completed', icon: CheckCircle2 },
  failed: { label: 'Failed', icon: XCircle },
};

export default function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`status-${status} font-medium`}>
      {showIcon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </Badge>
  );
}
