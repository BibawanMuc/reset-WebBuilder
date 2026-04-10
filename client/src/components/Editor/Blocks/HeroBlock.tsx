import { parseRichText } from '../../../utils/textParser';

interface HeroBlockProps {
  headline?: string;
  subline?: string;
  buttonText?: string;
  hideButton?: boolean;
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const HeroBlock = ({ headline, subline, buttonText, hideButton = false, bgType = 'default', bgColor, noShadow = false, showDecoration = true, paddingTop = 8, paddingBottom = 8, maxWidth = 100 }: HeroBlockProps) => {
  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClass = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClass = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  return (
    <div className={`w-full relative overflow-hidden rounded-theme my-4 ${bgClass} ${borderClass}`} style={{ ...customBg, paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem` }}>
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-secondary blur-[80px] opacity-20 pointer-events-none z-0"></div>
      )}
      
      <div className="relative z-10 px-8 flex flex-col items-start justify-center mx-auto" style={{ maxWidth: `${maxWidth}%` }}>
        <h1 
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
          dangerouslySetInnerHTML={parseRichText(headline || "Dein unglaublicher Slogan steht *hier*.")}
        />
        <p 
          className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed"
          dangerouslySetInnerHTML={parseRichText(subline || "Unterstützender Text, der Besuchern ++genau sagt++, was du anbietest und warum sie hier klicken sollten.")}
        />
        
        {!hideButton && (
          <button className="px-8 py-4 bg-primary text-white rounded-theme font-medium shadow-lg hover:opacity-90 transition-colors pointer-events-none">
            {buttonText || "Mehr erfahren"}
          </button>
        )}
      </div>
    </div>
  );
};
