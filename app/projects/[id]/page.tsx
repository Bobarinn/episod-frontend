import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ProjectPageContent from '@/components/ProjectPageContent';

export const dynamic = 'force-dynamic';

function ProjectLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">Loading project...</p>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectLoading />}>
      <ProjectPageContent />
    </Suspense>
  );
}
