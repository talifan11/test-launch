// Единый источник адресов и версий для всего фронтенда.

export const APP_NAME = 'Valheim Rouge';
export const LAUNCHER_VERSION = '0.1.0';

// Игровой сервер (UDP через WireGuard-туннель VPS -> домашний ПК)
export const GAME_SERVER_ADDRESS = '85.198.70.143:2456';

// Статический сервер раздачи файлов игры и манифестов
export const UPDATE_BASE_URL = 'http://62.217.178.72';
export const MANIFEST_URL = `${UPDATE_BASE_URL}/manifest.json`;
export const LAUNCHER_VERSION_URL = `${UPDATE_BASE_URL}/launcher-version.json`;

// Интервал автообновления статуса сервера (мс)
export const CONNECTION_REFRESH_MS = 15000;

// Ссылки сообщества
export const COMMUNITY_LINKS = {
  discord: 'https://discord.gg/valheimrouge',
  vk: 'https://vk.com/valheimrouge',
  telegram: 'https://t.me/valheimrouge',
};

export const UI_TEXT = {
  loginHint: 'Войдите, чтобы продолжить',
  installTitle: 'Установка игры',
  updateTitle: 'Обновление игры',
};
