'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/contexts/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'id' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('id')}
        className="flex items-center gap-2"
      >
        <span className="text-lg">🇮🇩</span>
        <span className="hidden sm:inline">ID</span>
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="flex items-center gap-2"
      >
        <span className="text-lg">🇺🇸</span>
        <span className="hidden sm:inline">EN</span>
      </Button>
    </div>
  );
}
