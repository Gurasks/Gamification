import { ArrowUpToLine } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;

      if (scrolled > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50 transition-all duration-300
        flex items-center justify-center
        rounded-full
        hover:scale-110 active:scale-95
        bottom-6 right-6
        bg-gradient-to-r from-blue-600 to-indigo-600
        hover:from-blue-700 hover:to-indigo-700
        text-white shadow-lg
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <div className="relative p-3.5">
        <ArrowUpToLine className="w-5 h-5" />
      </div>
    </button>
  );
};