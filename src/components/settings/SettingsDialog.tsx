// Диалог настроек: путь к игре, адрес сервера. Сохраняет через store.

import { FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pickDirectory } from '../../lib/api';
import { useLauncherStore } from '../../store/useLauncherStore';
import { toast } from '../../store/useToastStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const config = useLauncherStore((s) => s.config);
  const updateConfig = useLauncherStore((s) => s.updateConfig);
  const [gamePath, setGamePath] = useState(config.game_path);
  const [serverAddress, setServerAddress] = useState(config.server_address);

  // при каждом открытии подтягиваем актуальные значения из конфига
  useEffect(() => {
    if (open) {
      setGamePath(config.game_path);
      setServerAddress(config.server_address);
    }
  }, [open, config.game_path, config.server_address]);

  const browse = async (): Promise<void> => {
    const selected = await pickDirectory('Каталог с valheim.exe');
    if (selected !== null) {
      setGamePath(selected);
    }
  };

  const save = async (): Promise<void> => {
    if (serverAddress.trim() === '') {
      toast.error('Адрес сервера не может быть пустым');
      return;
    }
    await updateConfig({ game_path: gamePath.trim(), server_address: serverAddress.trim() });
    toast.success('Настройки сохранены');
    onClose();
  };

  return (
    <Modal open={open} title="Настройки" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
            Каталог игры
          </label>
          <div className="flex gap-2">
            <input
              className="vr-input vr-mono text-xs"
              value={gamePath}
              onChange={(e) => setGamePath(e.target.value)}
              placeholder="C:\Games\Valheim"
            />
            <Button onClick={() => void browse()} className="shrink-0">
              <FolderOpen size={16} />
              Обзор
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
            Адрес сервера
          </label>
          <input
            className="vr-input vr-mono text-xs"
            value={serverAddress}
            onChange={(e) => setServerAddress(e.target.value)}
            placeholder="85.198.70.143:2456"
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={() => void save()}>
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
