export type PathMode = 'launch' | 'acquire';

export type BridgeMission = {
  id: string;
  mode: PathMode;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  summary?: string | null;
  finalMessage?: string | null;
  logs?: string[];
};
