// Экран входа до авторизации. Заглушка: непустые поля считаются успехом.

import { motion } from 'framer-motion';
import { useState } from 'react';
import { APP_NAME } from '../config';
import { useLauncherStore } from '../store/useLauncherStore';
import { ShieldLogo } from '../components/ui/ShieldLogo';

export function LoginScreen() {
  const login = useLauncherStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (): void => {
    login(username, password);
  };

  return (
    <div className="vr-bg h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="vr-glass rounded-2xl p-10 w-[400px]"
      >
        <div className="flex flex-col items-center gap-4 mb-8">
          <ShieldLogo size={56} />
          <h1 className="vr-display text-xl text-white">{APP_NAME}</h1>
          <p className="text-sm text-white/45">Войдите, чтобы продолжить</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            className="vr-input"
            placeholder="Имя викинга"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            className="vr-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gold text-abyss font-bold uppercase
              tracking-wide hover:shadow-glowGold transition-all duration-300"
          >
            Войти в Вальхаллу
          </button>
        </form>
      </motion.div>
    </div>
  );
}
