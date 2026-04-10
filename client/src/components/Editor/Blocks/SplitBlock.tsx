import { Image as ImageIcon } from 'lucide-react';
import { parseRichText } from '../../../utils/textParser';

interface SplitBlockProps {
  imageLeft?: boolean;
  title?: string;
  text?: string;
  imageUrl?: string;
  buttonLabel?: string;
  bgType?: string;
  bgColor?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
  imageWidth?: number;
}

export const SplitBlock = ({ imageLeft = true, title, text, imageUrl, buttonLabel, bgType = 'default', bgColor, noShadow = false, showDecoration = false, paddingTop = 4, paddingBottom = 4, maxWidth = 100, imageWidth = 50 }: SplitBlockProps) => {
  const ImageContainer = () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center relative z-10">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title || "Split Block Image"} 
          className="w-full h-auto object-cover rounded-theme shadow-xl"
        />
      ) : (
        <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-theme border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
          <ImageIcon size={48} className="mb-4 opacity-50" />
          <p className="font-medium text-center px-4">Bild in der Sidebar ergänzen</p>
        </div>
      )}
    </div>
  );

  const TextContainer = () => (
    <div className="flex flex-col justify-center h-full px-4 py-8 md:p-12 pl-0 pr-0 relative z-10">
      <h2 
        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight"
        dangerouslySetInnerHTML={parseRichText(title || "Eine ++starke Aussage++ für dein Produkt.")}
      />
      <p 
        className="text-lg text-gray-600 mb-8 leading-relaxed"
        dangerouslySetInnerHTML={parseRichText(text || "Nutze diesen Text, um den Wert deines Bildes auf der anderen Seite hervorzuheben. Ein Split-Layout eignet sich perfekt, um **komplexe Informationen** in leicht verdauliche, visuelle Happen zu verpacken.")}
      />
      {buttonLabel && buttonLabel.trim() !== '' && (
        <div>
          <button className="px-6 py-3 bg-white border-2 border-primary text-primary rounded-theme font-bold hover:bg-primary hover:text-white transition-colors">
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const isWrapperCard = bgType === 'custom' || bgType === 'white' || (bgType === 'default' && false); // default split is transparent
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : '');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : (bgType === 'custom' ? 'border border-gray-100 shadow-sm' : '');
  const paddingClass = bgType === 'custom' ? 'p-8 md:p-12' : '';

  const decoPositionClass = imageLeft 
    ? "right-0 translate-x-1/3" 
    : "left-0 -translate-x-1/3";

  return (
    <div className="w-full mx-auto relative" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className={`absolute top-1/2 ${decoPositionClass} -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary blur-[120px] opacity-15 pointer-events-none z-0`}></div>
      )}

      <div 
        className={`grid grid-cols-1 ${imageLeft ? 'lg:grid-cols-[var(--split-img-w)_1fr]' : 'lg:grid-cols-[1fr_var(--split-img-w)]'} gap-8 md:gap-16 items-center rounded-theme ${bgClassGrid} ${borderClassGrid} ${paddingClass}`} 
        style={{ ...customBg, '--split-img-w': `${imageWidth}%` } as any}
      >
        {imageLeft ? (
          <>
            <ImageContainer />
            <TextContainer />
          </>
        ) : (
          <>
            <TextContainer />
            <ImageContainer />
          </>
        )}
      </div>
    </div>
  );
};
