// Логотип-щит с руной V. Используется в TitleBar, Sidebar и Login.

interface ShieldLogoProps {
  size?: number;
}

export function ShieldLogo({ size = 28 }: ShieldLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2 L28 7 V16 C28 23 22.5 28 16 30 C9.5 28 4 23 4 16 V7 Z"
        fill="rgba(255,194,75,0.08)"
        stroke="#ffc24b"
        strokeWidth="1.6"
      />
      <path
        d="M10.5 10.5 L16 21.5 L21.5 10.5"
        stroke="#ffc24b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
