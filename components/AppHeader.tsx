'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsDialog from '@/components/SettingsDialog';
import CreateProjectSheet from '@/components/CreateProjectSheet';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/api';

const STATUS_FILTER_OPTIONS: { value: 'all' | ProjectStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'queued', label: 'Queued' },
  { value: 'planning', label: 'Planning' },
  { value: 'generating', label: 'Generating' },
  { value: 'rendering', label: 'Rendering' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter =
    (searchParams.get('status') as 'all' | ProjectStatus | null) || 'all';
  const isValidStatus =
    statusFilter === 'all' ||
    STATUS_FILTER_OPTIONS.some((o) => o.value === statusFilter);

  const displayStatus = isValidStatus ? statusFilter : 'all';

  const handleStatusChange = (value: string) => {
    const status = value as 'all' | ProjectStatus;
    if (pathname === '/') {
      const params = new URLSearchParams(searchParams.toString());
      if (status === 'all') {
        params.delete('status');
      } else {
        params.set('status', status);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/');
    } else {
      router.push(status === 'all' ? '/' : `/?status=${status}`);
    }
  };

  const handleProjectCreated = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-xl font-display font-bold tracking-tight">
                  EPISOD
                </span>
              </motion.div>
            </Link>
            <div className="flex items-center gap-2 sm:hidden">
              <CreateProjectSheet onProjectCreated={handleProjectCreated} />
              <SettingsDialog />
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <label
              htmlFor="header-status-filter"
              className="text-sm font-medium text-muted-foreground shrink-0"
            >
              Status:
            </label>
            <select
              id="header-status-filter"
              value={displayStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={cn(
                'h-8 rounded-md border border-input bg-background px-2.5 py-1 text-sm font-medium min-w-[7rem]',
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
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <CreateProjectSheet onProjectCreated={handleProjectCreated} />
            <SettingsDialog />
          </div>
        </div>
      </div>
    </header>
  );
}
