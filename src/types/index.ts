// Все доменные типы фронтенда. Rust-структуры сериализуются в эти формы.

export interface LauncherConfig {
  game_path: string;
  server_address: string;
  username: string;
}

export type ServerStatusValue = 'online' | 'active' | 'offline';

export interface ManifestFile {
  path: string;
  url: string;
  size: number;
  sha256: string;
}

export interface Manifest {
  version: string;
  files: ManifestFile[];
}

export interface FileStatus {
  path: string;
  expected_size: number;
  actual_size: number;
  ok: boolean;
}

export interface ProgressEvent {
  file: string;
  received: number;
  total: number;
  done_files: number;
  total_files: number;
  speed_bps: number;
}

export interface LauncherVersionInfo {
  version: string;
  url: string;
  notes: string;
}

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'needs-install'
  | 'needs-update'
  | 'downloading'
  | 'unpacking'
  | 'ready'
  | 'error';

export interface Session {
  username: string;
  loggedInAt: number;
}

export interface NewsItem {
  id: string;
  kind: 'patch' | 'event' | 'update' | 'maintenance';
  title: string;
  summary: string;
  date: string;
  tag: string;
  accent?: 'gold' | 'blizzard' | 'emerald' | 'blood';
}
