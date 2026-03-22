'use client';

import { useParams, useRouter } from 'next/navigation';
import ProjectDetail from '@/components/ProjectDetail';
import AppHeader from '@/components/AppHeader';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <p className="text-muted-foreground">Project not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <ProjectDetail projectId={id} onClose={() => router.push('/')} />
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
