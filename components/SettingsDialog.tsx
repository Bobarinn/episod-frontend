'use client';

import { useState } from 'react';
import { Settings, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { checkHealth } from '@/lib/api';

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [healthMessage, setHealthMessage] = useState('');

  const handleTestHealth = async () => {
    setHealthStatus('checking');
    setHealthMessage('Testing connection...');

    try {
      const result = await checkHealth();

      if (result.status === 'ok' || result.status === 'alive') {
        setHealthStatus('success');
        setHealthMessage('Connection successful');
      } else {
        setHealthStatus('error');
        setHealthMessage('Unexpected response from server');
      }
    } catch (error) {
      setHealthStatus('error');
      setHealthMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTimeout(() => {
      setHealthStatus('idle');
      setHealthMessage('');
    }, 5000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            EPISOD API connection status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>API key and backend URL are configured server-side via environment variables.</span>
          </div>

          {healthMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                healthStatus === 'success'
                  ? 'bg-green-50 text-green-700'
                  : healthStatus === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {healthStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {healthStatus === 'error' && <XCircle className="h-4 w-4" />}
              {healthStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{healthMessage}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleTestHealth}
          disabled={healthStatus === 'checking'}
          className="w-full"
        >
          {healthStatus === 'checking' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
