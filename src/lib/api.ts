// Единственная точка обращения к Rust-командам. Компоненты invoke не вызывают.

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { GAME_SERVER_ADDRESS, UPDATE_BASE_URL } from '../config';
import type {
  FileStatus,
  LauncherConfig,
  LauncherVersionInfo,
  Manifest,
  ManifestFile,
  ProgressEvent,
  ServerStatusValue,
} from '../types';

export { UPDATE_BASE_URL, GAME_SERVER_ADDRESS };

export function getConfig(): Promise<LauncherConfig> {
  return invoke<LauncherConfig>('get_config');
}

export function saveConfig(cfg: LauncherConfig): Promise<LauncherConfig> {
  return invoke<LauncherConfig>('save_config', { cfg });
}

export function pingServer(address: string): Promise<ServerStatusValue> {
  return invoke<string>('ping_server', { address }) as Promise<ServerStatusValue>;
}

export function launchGame(gamePath: string): Promise<void> {
  return invoke<void>('launch_game', { gamePath });
}

export function fetchManifest(): Promise<Manifest> {
  return invoke<Manifest>('fetch_manifest');
}

export function checkFiles(gamePath: string, files: ManifestFile[]): Promise<FileStatus[]> {
  return invoke<FileStatus[]>('check_files', { gamePath, files });
}

export function downloadBatch(files: ManifestFile[]): Promise<string[]> {
  return invoke<string[]>('download_batch', { files });
}

export function cancelDownload(): Promise<void> {
  return invoke<void>('cancel_download');
}

export function resolveDownloadPath(filePath: string): Promise<string> {
  return invoke<string>('resolve_download_path', { filePath });
}

export function unpackZip(zipPath: string, gamePath: string): Promise<number> {
  return invoke<number>('unpack_zip', { zipPath, gamePath });
}

export function getInstalledVersion(): Promise<string | null> {
  return invoke<string | null>('get_installed_version');
}

export function setInstalledVersion(version: string): Promise<void> {
  return invoke<void>('set_installed_version', { version });
}

export function checkLauncherUpdate(): Promise<LauncherVersionInfo | null> {
  return invoke<LauncherVersionInfo | null>('check_launcher_update');
}

export function onDownloadProgress(
  handler: (event: ProgressEvent) => void,
): Promise<() => void> {
  return listen<ProgressEvent>('download-progress', (e) => handler(e.payload));
}

export function onUnpackProgress(
  handler: (event: ProgressEvent) => void,
): Promise<() => void> {
  return listen<ProgressEvent>('unpack-progress', (e) => handler(e.payload));
}

export async function pickDirectory(title: string): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false, title });
  if (typeof selected === 'string') {
    return selected;
  }
  return null;
}

export function openExternal(url: string): Promise<void> {
  return shellOpen(url);
}
