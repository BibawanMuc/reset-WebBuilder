import { useProjectStore } from '../../../store/useProjectStore';
import { useState } from 'react';
import { X } from 'lucide-react';

interface NavbarBlockProps {
  links?: string; // Comma separated list
  logoText?: string;
  hideButton?: boolean;
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const NavbarBlock = ({ 
  links, 
  logoText, 
  hideButton = false, 
  bgType = 'default', 
  bgColor, 
  noShadow = false, 
  showDecoration = false,
  paddingTop = 1,
  paddingBottom = 1,
  maxWidth = 100
}: NavbarBlockProps) => {
  const { activeProject } = useProjectStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const config = activeProject?.config;

  const parsedLinks = links 
    ? links.split(',').map(l => l.trim()).filter(l => l.length > 0)
    : ["Home", "Features", "Preise", "Kontakt"];

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClass = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClass = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border-b border-gray-100 shadow-sm';

  return (
    <div className={`w-full mx-auto`} style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className={`w-full flex items-center px-8 py-4 mb-4 rounded-theme relative overflow-hidden ${bgClass} ${borderClass}`} style={customBg}>
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-secondary blur-[50px] opacity-20 pointer-events-none z-0"></div>
      )}

      {/* Logo Area */}
      <div className="flex items-center gap-3 relative z-10 mr-auto">
        {config?.logo ? (
          <img src={config.logo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
        ) : (
          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center font-bold text-gray-500">
            L
          </div>
        )}
        <span className="font-bold text-xl tracking-tight text-gray-900">
          {logoText || activeProject?.name || "Mein Projekt"}
        </span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 relative z-10 mr-8">
        {parsedLinks.map((link, i) => (
          <a 
            key={i} 
            href={`#${link}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(link);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Action Area */}
      {!hideButton && (
        <div className="hidden md:block relative z-10">
          <button className="px-5 py-2.5 bg-primary text-white rounded-theme text-sm font-medium hover:opacity-90 transition-opacity pointer-events-none">
            Get Started
          </button>
        </div>
      )}

      {/* Mobile Menu Icon */}
      <div 
        className="md:hidden flex flex-col gap-1.5 cursor-pointer relative z-10 p-2 -mr-2"
        onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }}
      >
        <div className="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
        <div className="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
        <div className="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col pt-24 px-8 shadow-xl md:hidden">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }} 
            className="absolute top-8 right-8 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col gap-6 text-xl font-medium text-gray-800">
            {parsedLinks.map((link, i) => (
              <a 
                key={i} 
                href={`#${link}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById(link);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block border-b border-gray-100 pb-4"
              >
                {link}
              </a>
            ))}
          </div>
          {!hideButton && (
            <button className="mt-8 px-5 py-3 w-full bg-primary text-white rounded-theme text-lg font-medium pointer-events-none">
              Get Started
            </button>
          )}
        </div>
      )}
    </div>
    </div>
  );
};
