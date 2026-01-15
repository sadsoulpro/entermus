import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = ({ variant = 'default', className = '' }) => {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const currentLang = languages[language] || languages.en;

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Compact variant for header
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase">{language}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 py-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 min-w-[140px]"
            >
              {Object.values(languages).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    language === lang.code
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant (horizontal buttons)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {Object.values(languages).map((lang, index) => (
          <React.Fragment key={lang.code}>
            {index > 0 && <span className="text-zinc-600">|</span>}
            <button
              onClick={() => setLanguage(lang.code)}
              className={`px-1.5 py-0.5 text-sm font-medium transition-colors ${
                language === lang.code
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 py-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 min-w-[160px]"
          >
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.nativeName}</span>
                {language === lang.code && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
