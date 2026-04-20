import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="px-4 py-2 rounded-none border-2 transition-colors duration-200
        bg-brutalist-yellow text-brutalist-gray
        border-brutalist-yellow
        hover:bg-brutalist-yellow-dark
        font-sans font-bold text-sm uppercase tracking-wide
        cursor-default"
      aria-label="Brutalist theme"
    >
      RUN
    </button>
  );
}